import { buildLexer } from "typescript-parsec";

export enum PreprocessorTokenKind {
  Code,
  Directive,
}

export const lexer = buildLexer([
  [
    true,
    new RegExp(
      /^#(|define|undef|if|ifdef|ifndef|else|elif|endif|error|pragma|extension|line)\n/g
    ),
    PreprocessorTokenKind.Directive,
  ],
  [true, new RegExp(/^[/s/S]+/g), PreprocessorTokenKind.Code],
]);
