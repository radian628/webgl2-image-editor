import { buildLexer, tok } from "typescript-parsec";
import { GLSL_KEYWORDS, GLSL_SYMBOLS } from "./glsl-keywords";

export enum TokenKind {
  Symbol,
  Keyword,
  Whitespace,
  Comment,
  Identifier,
  IntegerDecimal,
  IntegerOctal,
  IntegerHex,
  Float,
  ImportString,
}

export const lexer = buildLexer([
  // all keywords
  [
    true,
    new RegExp(GLSL_KEYWORDS.map((k) => `^${k}`).join("|"), "g"),
    TokenKind.Keyword,
  ],
  // all symbols
  [
    true,
    new RegExp(
      `^(${GLSL_SYMBOLS.map((s) =>
        s
          .split("")
          .map((c) => `\\${c}`)
          .join("")
      ).join("|")})`,
      "g"
    ),
    TokenKind.Symbol,
  ],
  // whitespace
  [false, /^\s+/g, TokenKind.Whitespace],
  // comments (comments will be included in AST)
  [true, /^(\/\/[^\n]*\n)|^(\/\*[\s\S]*?\*\/)/g, TokenKind.Comment],
  // identifiers
  [true, /^[a-zA-Z_][a-zA-Z0-9_]*/g, TokenKind.Identifier],
  // ints
  [true, /^[1-9][0-9]*[uU]?/g, TokenKind.IntegerDecimal],
  [true, /^0[0-7]*[uU]?/g, TokenKind.IntegerOctal],
  [true, /^0[xX][0-9a-fA-F]+[uU]?/g, TokenKind.IntegerHex],
  // floats
  [
    true,
    /^([0-9]+\.[0-9]*|\.[0-9]+)([eE][\+\-]?[0-9]+)?[fF]?/g,
    TokenKind.Float,
  ],
  [true, /^[0-9]+[eE][\+\-][0-9]+[fF]?/g, TokenKind.Float],
  // import strings
  [true, /^"[^"]*"/g, TokenKind.ImportString],
]);
