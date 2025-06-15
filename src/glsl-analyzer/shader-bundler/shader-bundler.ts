import { err, ok, Result } from "../../utils/result";
import { ArrayMap, Table, table } from "../../utils/table";
import {
  getAllStatementsInsideStmt,
  mapAllStatementsInsideExtDecl,
  mapAllSymbolsDefinedByExtDecl,
  mapAllSymbolsDefinedByStmt,
  mapAllSymbolsDefinedInsideExtDecl,
  mapAllSymbolsDefinedInsideStmt,
  mapGlobalSymbols,
  renameSymbols,
} from "../glsl-ast-utils";
import {
  ASTNode,
  Commented,
  dummyNode,
  ExternalDeclaration,
  Stmt,
  TranslationUnit,
} from "../parser";
import { parseGLSLWithoutPreprocessing } from "../parser-combined";

export type ResolvedPath = Result<
  | {
      type: "string";
      string: string;
    }
  | {
      type: "ast";
      unit: TranslationUnit;
    },
  string
>;

export type BundleShadersArgs = {
  entryPoint: string;
  resolvePath: (path: string) => Promise<ResolvedPath>;
  mainFunctionName: string;
};

export type BundleShadersReturnType = {
  code: TranslationUnit;
};

export async function resolveImports(
  args: BundleShadersArgs
): Promise<Result<Map<string, TranslationUnit>, string>> {
  const { entryPoint, resolvePath } = args;
  let unresolved = [entryPoint];

  const resolvedFiles = new Map<string, TranslationUnit>();

  while (unresolved.length > 0) {
    const fileSources = await Promise.all(
      unresolved.map(async (p) => ({
        path: p,
        source: await args.resolvePath(p),
      }))
    );
    unresolved = [];

    for (const src of fileSources) {
      let translationUnit: TranslationUnit;

      if (!src.source.data.success)
        return err(`Failed to resolve file '${src.path}'.`);

      const file = src.source.data.data;

      if (file.type === "ast") {
        translationUnit = file.unit;
      } else {
        const maybeParsed = parseGLSLWithoutPreprocessing(file.string);
        if (!maybeParsed.data.success)
          return err(`Failed to parse file '${src.path}'.`);
        translationUnit = maybeParsed.data.data.translationUnit;
      }

      resolvedFiles.set(src.path, translationUnit);

      for (const ed of translationUnit.data) {
        if (ed.data.type === "import" && !resolvedFiles.has(ed.data.from)) {
          unresolved.push(ed.data.from);
        }
      }
    }
  }

  return ok(resolvedFiles);
}

export function consolidateFiles(
  args: BundleShadersArgs & { resolvedFiles: Map<string, TranslationUnit> }
): Result<TranslationUnit, string> {
  const encounteredNames = new Set<string>();

  const renamedGlobals = new ArrayMap<string, string, [string, string]>();

  const allGlobalSymbols = new Set<string>();

  const globalSymbolsInFile = new Map<string, Set<string>>();

  // find out how to rename global symbols
  for (const [filename, t] of [...args.resolvedFiles.entries()]) {
    const globalSymbols = new Set<string>();

    mapGlobalSymbols(t, (n) => {
      globalSymbols.add(n);
      return n;
    });

    globalSymbolsInFile.set(filename, globalSymbols);

    for (const g of globalSymbols) {
      if (allGlobalSymbols.has(g)) {
        let i = 0;
        let candidateName = `${g}_${i}`;
        while (allGlobalSymbols.has(candidateName)) {
          i++;
          candidateName = `${g}_${i}`;
        }

        renamedGlobals.set([filename, g], candidateName);
        allGlobalSymbols.add(candidateName);
      }
    }

    for (const g of globalSymbols) {
      allGlobalSymbols.add(g);
    }
  }

  const out: TranslationUnit = dummyNode([]);

  const importedSymbols = new ArrayMap<
    string,
    [string, string],
    [string, string]
  >();

  for (const [filename, t] of [...args.resolvedFiles.entries()]) {
    for (const e of t.data) {
      if (e.data.type === "import") {
        const globalSymbols = globalSymbolsInFile.get(e.data.from);
        if (!globalSymbols) {
          return err(`Could not find file '${e.data.from}'.`);
        }
        if (e.data.imports.data.type === "all") {
          for (const g of globalSymbols) {
            importedSymbols.set(
              [filename, e.data.imports.data.prefix + g],
              [e.data.from, g]
            );
          }
        } else if (e.data.imports.data.type === "some") {
          for (const i of e.data.imports.data.imports) {
            importedSymbols.set(
              [filename, i.data.alias ?? i.data.name],
              [e.data.from, i.data.name]
            );
          }
        }
      }
    }
  }

  function renameLocal(local: string) {
    let candidate = local;
    let i = 0;
    while (allGlobalSymbols.has(candidate)) {
      candidate = local + `_` + i;
      i++;
    }
    return candidate;
  }

  function getLocalsRecursively(s: ASTNode<Stmt>, locals: Set<string>): void {
    mapAllSymbolsDefinedByStmt(s, (s) => {
      locals.add(s);
      return s;
    });
    for (const s2 of getAllStatementsInsideStmt(s)) {
      getLocalsRecursively(s2, locals);
    }
  }

  const resolvedFiles2 = [...args.resolvedFiles.entries()].map(([f, t]) => {
    const t2: TranslationUnit = dummyNode([]);
    for (const ed of t.data) {
      const locals = new Set<string>();
      mapAllSymbolsDefinedInsideExtDecl(ed, (s) => {
        return s;
      });

      mapAllStatementsInsideExtDecl(ed, (s) => {
        getLocalsRecursively(s, locals);
        return s;
      });

      t2.data.push(
        renameSymbols(ed, (s) => (locals.has(s) ? renameLocal(s) : s))
      );
    }
    return [f, t2] as const;
  });

  for (const [filename, t] of resolvedFiles2) {
    for (const e of t.data) {
      if (e.data.type === "import") continue;

      out.data.push(
        renameSymbols(e, (s) => {
          const imported = importedSymbols.get([filename, s]);
          if (imported) {
            return renamedGlobals.get(imported) ?? imported[1];
          }

          return renamedGlobals.get([filename, s]) ?? s;
        })
      );
    }
  }

  return ok(out);
}

export async function bundleShaders(
  args: BundleShadersArgs
): Promise<Result<BundleShadersReturnType, string>> {
  const resolvedFiles = await resolveImports(args);

  if (!resolvedFiles.data.success) return resolvedFiles as any;

  const bundle = consolidateFiles({
    ...args,
    resolvedFiles: resolvedFiles.data.data,
  });

  return bundle.mapS((t) => ({
    code: toposortExtDecls(t, args.mainFunctionName),
  }));
}

export function toposortExtDecls(unit: TranslationUnit, mainName: string) {
  const out: ASTNode<ExternalDeclaration>[] = [];
  const dependencies: Table<{
    decl: ASTNode<ExternalDeclaration>;
    dep: string;
  }> = table();
  const globalSymbols = new Set<string>();

  mapGlobalSymbols(unit, (s) => (globalSymbols.add(s), s));

  // establish dependencies between functions, types, etc.
  for (const e of unit.data) {
    const deps: string[] = [];
    renameSymbols(e, (r) => {
      if (globalSymbols.has(r)) deps.push(r);
      return r;
    });
    const mySymbols: string[] = [];
    mapAllSymbolsDefinedByExtDecl(e, (s) => (mySymbols.push(s), s));
    const mySymbolsSet = new Set(mySymbols);
    for (const d of deps) {
      if (mySymbolsSet.has(d)) continue;
      dependencies.add({
        dep: d,
        decl: e,
      });
    }
  }

  const nodeSet = new Set(unit.data);

  // eliminate dead code
  for (const e of unit.data) {
    const mySymbols: string[] = [];
    mapAllSymbolsDefinedByExtDecl(e, (s) => (mySymbols.push(s), s));
    const mySymbolsSet = [...new Set(mySymbols)];
    if (
      mySymbolsSet.every((s) => s !== mainName) &&
      mySymbolsSet.every((s) => dependencies.filter.dep(s).get().length === 0)
    ) {
      nodeSet.delete(e);
    }
  }

  // find out nodes with no dependencies
  const remainingNodes = [...nodeSet].filter(
    (e) => dependencies.filter.decl(e).get().length === 0
  );

  // toposort DAG
  while (remainingNodes.length > 0) {
    const n = remainingNodes.shift()!;
    out.push(n);

    const mySymbols: string[] = [];
    mapAllSymbolsDefinedByExtDecl(n, (s) => (mySymbols.push(s), s));

    const edgesFromN = mySymbols.flatMap((s) =>
      dependencies.filter.dep(s).delete()
    );
    const nodesFromN = new Set(edgesFromN.map((e) => e.decl));

    for (const m of nodesFromN) {
      const edgesToM = dependencies.filter.decl(m).get();

      if (edgesToM.length === 0) {
        remainingNodes.push(m);
      }
    }
  }

  return dummyNode(out);
}
