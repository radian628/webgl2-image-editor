import {
  createOverridableVirtualFilesystem,
  FilesystemAdaptor,
} from "../../filesystem/FilesystemAdaptor";
import { autocompletion } from "@codemirror/autocomplete";
import {
  ASTNode,
  Commented,
  Declaration,
  FullySpecifiedType,
  FunctionCallExpr,
  FunctionHeader,
  Stmt,
  TranslationUnit,
} from "../parser";
import { parseGLSLWithoutPreprocessing } from "../parser-combined";
import {
  mapAllStatementsInsideExtDecl,
  mapAST,
  renameSymbols,
} from "../glsl-ast-utils";
import { id, lens } from "../../utils/lens";
import { getExprType } from "./typecheck";

export type GLSLAutocompleteOption = {
  str: string;
  type: "variable" | "function" | "type" | "keyword";
};

export type ScopeItem =
  | {
      dataType: Commented<FullySpecifiedType>;
      name: Commented<string>;
      type: "variable";
    }
  | {
      type: "function";
      signature: Commented<FunctionHeader>;
    };

export type Scope = {
  items: Map<string, ScopeItem>;
  innerScopes: Scope[];
  start: number;
  end: number;
};

export type GLSLSemanticAnalysis = {
  translationUnit: TranslationUnit;
  globalScope: Scope;
};

export type GLSLSignatureHelp = {
  name: string;
  signature: Commented<FunctionHeader>;
};

export function scopeFind(
  scopes: Scope[],
  name: string
): ScopeItem | undefined {
  const lastScope = scopes.at(-1);
  if (!lastScope) return undefined;
  return lastScope.items.get(name) ?? scopeFind(scopes.slice(0, -1), name);
}

function getEnclosingScopes(scope: Scope, pos: number): Scope[] {
  const res = [scope];
  for (const innerScope of scope.innerScopes) {
    if (pos >= innerScope.start && pos < innerScope.end) {
      return res.concat(getEnclosingScopes(innerScope, pos));
    }
  }
  return res;
}

function joinAndNormalizePath(a: string, b: string) {
  const joined = a.split("/").concat(b.split("/"));

  const folderDelta: string[] = [];
  let parentLevels = 0;
  for (const segment of joined) {
    if (segment === ".") continue;
    if (segment === "..") {
      if (folderDelta.length > 0) {
        folderDelta.pop();
      } else {
        parentLevels++;
      }
      continue;
    }
    folderDelta.push(segment);
  }

  let finalPath = [];
  for (let i = 0; i < parentLevels; i++) finalPath.push("..");
  return finalPath.concat(folderDelta).join("/");
}

function addDeclScopeItems(
  decl: Commented<Declaration>,
  items: Map<string, ScopeItem>
) {
  if (
    decl.data.type === "declarator-list" &&
    decl.data.declaratorList.data.init.data.type !== "invariant"
  ) {
    for (const item of decl.data.declaratorList.data.declarations.data) {
      items.set(item.data.name.data, {
        type: "variable",
        name: item.data.name,
        dataType: decl.data.declaratorList.data.init.data.declType,
      });
    }
  }
}

async function addStatementScopeItems(
  stmt: ASTNode<Stmt>,
  items: Map<string, ScopeItem>
) {
  if (stmt.data.type === "declaration") {
    addDeclScopeItems(stmt.data.decl, items);
  }
}

function generateLocalScope(stmt: ASTNode<Stmt>, filecontents: string): Scope {
  const items = new Map<string, ScopeItem>();
  const innerScopes: Scope[] = [];
  if (stmt.data.type === "compound") {
    for (const s of stmt.data.statements) {
      addStatementScopeItems(s, items);
    }
  } else if (stmt.data.type === "do-while" || stmt.data.type === "while") {
    innerScopes.push(generateLocalScope(stmt.data.body, filecontents));
  } else if (stmt.data.type === "for") {
    addStatementScopeItems(stmt.data.body, items);
    innerScopes.push(generateLocalScope(stmt.data.body, filecontents));
  } else if (stmt.data.type === "selection") {
    innerScopes.push(generateLocalScope(stmt.data.rest.data.if, filecontents));
    if (stmt.data.rest.data.else)
      innerScopes.push(
        generateLocalScope(stmt.data.rest.data.else, filecontents)
      );
  } else if (stmt.data.type === "switch") {
    for (const s of stmt.data.stmts) {
      addStatementScopeItems(s, items);
    }
  }
  return {
    items,
    innerScopes,
    start: stmt.range.start,
    end: stmt.range.end ?? filecontents.length,
  };
}

async function generateGlobalScope(
  filepath: string,
  filecontents: string,
  ast: TranslationUnit,
  ctx: SemanticAnalysisContext
): Promise<Scope> {
  const items = new Map<string, ScopeItem>();
  const innerScopes: Scope[] = [];
  for (const ed of ast.data) {
    // function definitions
    if (ed.data.type === "function") {
      items.set(ed.data.prototype.data.name.data, {
        type: "function",
        signature: ed.data.prototype,
      });

      // variables and struct definitions and function prototypes
    } else if (ed.data.type === "declaration") {
      const decl = ed.data.decl;
      addDeclScopeItems(decl, items);

      // imports from other files
    } else if (ed.data.type === "import") {
      const imp = ed.data.imports.data;
      const path = joinAndNormalizePath(filepath, ed.data.from);
      const a = await semanticallyAnalyzeGLSL(path, ctx);
      if (imp.type === "all") {
        const prefix = imp.prefix;
        for (const [k, v] of a?.globalScope.items ?? []) {
          items.set(prefix + k, v);
        }
      } else if (imp.type === "some") {
        const filter = new Map(
          imp.imports.map((i) => [i.data.name, i.data.alias])
        );
        for (const [k, v] of a?.globalScope.items ?? []) {
          const filterItem = filter.get(k);
          if (!filterItem) continue;
          items.set((filterItem ?? "") + k, v);
        }
      }
    }

    // local scopes
    if (ed.data.type === "function") {
      innerScopes.push(await generateLocalScope(ed.data.body, filecontents));
    }
  }
  return {
    items,
    innerScopes,
    start: ast.range.start,
    end: ast.range.end ?? filecontents.length,
  };
}

export function getFunctionCallName(call: FunctionCallExpr): string {
  let name: string = "";
  lens(call).identifier.$m("type", {
    "type-specifier": (e) =>
      e.specifier.data.typeName.data.$m("type", {
        builtin: (e) => e.name.data.$((s) => (name = s)),
        custom: (e) => e.name.data.$((s) => (name = s)),
        struct: (e) => e.struct.data.name.data.$((s) => (name = s)),
      }),
    "function-identifier": (e) => e.identifier.$((s) => (name = s)),
  });
  return name;
}

async function semanticallyAnalyzeGLSL(
  filepath: string,
  ctx: SemanticAnalysisContext
): Promise<GLSLSemanticAnalysis | undefined> {
  const fileData = ctx.semanticAnalysisInfo.get(filepath);
  const versions = ctx.fileVersions.get(filepath);

  // up-to-date
  if (fileData && versions && versions.version === fileData?.version) {
    return fileData.info;
  }

  // not up-to-date; do semantic analysis again
  let fileStr = versions?.data;
  if (!fileStr) {
    // refetch the file
    fileStr = await (await ctx.fs.readFile(filepath))?.text();
    // if file exists, set it
    if (fileStr !== undefined) {
      ctx.fileVersions.set(filepath, {
        data: fileStr,
        version: versions?.version === undefined ? 0 : versions?.version + 1,
      });

      // if file doesn't exist, do no semantic analysis
    } else {
      return;
    }
  }
  const fileStrWithoutVersion = fileStr.replace(
    /^\s*#version\s+300\s+es/g,
    (s) => "".padEnd(s.length, " ")
  );

  const parseResult = parseGLSLWithoutPreprocessing(fileStrWithoutVersion);
  if (!parseResult.data.success) {
    return;
  }

  const globalScope = await generateGlobalScope(
    filepath,
    fileStrWithoutVersion,
    parseResult.data.data.translationUnit,
    ctx
  );

  return {
    globalScope,
    translationUnit: parseResult.data.data.translationUnit,
  };
}

type SemanticAnalysisContext = {
  fs: FilesystemAdaptor;
  fileVersions: Map<string, { version: number; data: string | undefined }>;
  semanticAnalysisInfo: Map<
    string,
    { info: GLSLSemanticAnalysis; version: number }
  >;
};

export type GLSLDiagnostic = {
  start: number;
  end: number;
  why: string;
};

export function makeGLSLLanguageServer(context: { fs: FilesystemAdaptor }) {
  const { fs } = context;

  const fileVersions = new Map<
    string,
    {
      version: number;
      // file data is fetched on-demand
      data: string | undefined;
    }
  >();

  fs.watchPattern(
    "root",
    (path) =>
      path.endsWith(".vert") ||
      path.endsWith(".frag") ||
      path.endsWith(".glsl"),
    (path) => {
      const ver = fileVersions.get(path) ?? {
        version: 0,
      };
      fileVersions.set(path, {
        version: ver.version + 1,
        data: undefined,
      });
    }
  );

  const semanticAnalysisInfo = new Map<
    string,
    {
      info: GLSLSemanticAnalysis;
      version: number;
    }
  >();

  return {
    async getDiagnostics(file: string) {
      const sem = await semanticallyAnalyzeGLSL(file, {
        fileVersions,
        semanticAnalysisInfo,
        fs,
      });

      if (!sem) return;

      const diagnostics: GLSLDiagnostic[] = [];

      console.log(sem.translationUnit);

      mapAST(sem.translationUnit, {
        error(err, mapInner) {
          diagnostics.push({
            start: err.range.start,
            end: err.range.end,
            why: err.data.why,
          });
          console.log("syntaxerr", err);
          return err;
        },

        expr(expr, mapInner) {
          mapInner(expr);

          if (expr.data.type === "ident") {
            const scope = getEnclosingScopes(sem.globalScope, expr.range.start);

            const def = scopeFind(scope, expr.data.ident);

            if (!def) {
              diagnostics.push({
                start: expr.range.start,
                end: expr.range.end,
                why: `'${expr.data.ident}' is not defined in this scope.`,
              });
            }
          } else if (expr.data.type === "function-call") {
            const scope = getEnclosingScopes(sem.globalScope, expr.range.start);

            const fnName = getFunctionCallName(expr.data);

            const def = scopeFind(scope, fnName);

            if (!def) {
              diagnostics.push({
                start: expr.range.start,
                end: expr.range.start + fnName.length,
                why: `'${fnName}' is not defined in this scope.`,
              });
            } else if (def.type !== "function") {
              diagnostics.push({
                start: expr.range.start,
                end: expr.range.start + fnName.length,
                why: `'${fnName}' is not a function.`,
              });
            }
          }

          return expr;
        },
      });

      mapAST(sem.translationUnit, {
        expr(expr, mapInner) {
          const scope = getEnclosingScopes(sem.globalScope, expr.range.start);
          const type = getExprType(expr, scope);

          for (const t of type.errors) {
            diagnostics.push({
              start: t.start,
              end: t.end,
              why: t.why,
            });
          }

          return expr;
        },
      });

      return diagnostics;
    },

    async getSignatureHelp(
      file: string,
      pos: number
    ): Promise<GLSLSignatureHelp | undefined> {
      const sem = await semanticallyAnalyzeGLSL(file, {
        fileVersions,
        semanticAnalysisInfo,
        fs,
      });

      if (!sem) return;

      const enclosingScopes = getEnclosingScopes(sem.globalScope, pos);

      // get all function calls in document
      const fncalls: ASTNode<FunctionCallExpr>[] = [];
      mapAST(sem.translationUnit, {
        expr(expr, mapInner) {
          if (expr.data.type === "function-call") {
            fncalls.push(expr as ASTNode<FunctionCallExpr>);
          }
          mapInner(expr);
          return expr;
        },
      });

      // find the smallest enclosing function call
      let callRange = Infinity;
      let fncall: ASTNode<FunctionCallExpr> | undefined = undefined;
      for (const call of fncalls) {
        if (pos >= call.range.start && pos < call.range.end) {
          const currRange = call.range.end - call.range.start;
          if (currRange < callRange) {
            callRange = currRange;
            fncall = call;
          }
        }
      }
      if (!fncall) return;

      // get its prototype
      const fnname = getFunctionCallName(fncall.data);
      const fnproto = scopeFind(enclosingScopes, fnname);
      if (!fnproto || fnproto.type !== "function") return;

      return {
        name: fnname,
        signature: fnproto.signature,
      };
    },

    async getAutocompleteOptions(
      file: string,
      pos: number
    ): Promise<GLSLAutocompleteOption[]> {
      const a = await semanticallyAnalyzeGLSL(file, {
        fileVersions,
        semanticAnalysisInfo,
        fs,
      });

      if (!a) return [];

      const enclosingScopes = getEnclosingScopes(a.globalScope, pos);

      return enclosingScopes
        .map((e) => [
          ...e.items.entries().map(([k, v]) => {
            if (v.type === "variable") {
              return {
                type: "variable",
                str: k,
              } satisfies GLSLAutocompleteOption;
            } else {
              return {
                type: "function",
                str: k,
              } satisfies GLSLAutocompleteOption;
            }
          }),
        ])
        .flat(1);
    },
  };
}
