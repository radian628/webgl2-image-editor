import { err, ok, Result } from "../../utils/result";
import { ArrayMap } from "../../utils/table";
import { TranslationUnit } from "../parser";
import { parseGLSLWithoutPreprocessing } from "../parser-combined";

export type BundleShadersArgs = {
  entryPoint: string;
  resolvePath: (path: string) => Promise<
    Result<
      | {
          type: "string";
          string: string;
        }
      | {
          type: "ast";
          unit: TranslationUnit;
        },
      string
    >
  >;
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

export async function bundleShaders(
  args: BundleShadersArgs
): Promise<BundleShadersReturnType> {
  const { entryPoint, resolvePath } = args;

  const resolvedFiles = await resolveImports(args);
}
