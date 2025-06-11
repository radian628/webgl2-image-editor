import {
  expectEOF,
  expectSingleResult,
  Parser,
  Token,
} from "typescript-parsec";
import { err, ok, Result } from "../utils/result";
import { lexer, TokenKind } from "./lexer";
import { translation_unit, TranslationUnit } from "./parser";

export type ParserResult = {
  translationUnit: TranslationUnit;
};

export type ParserError = {
  why: string;
};

export function lexGLSL(
  source: string
): Result<Token<TokenKind> | undefined, ParserError> {
  const tokens = lexer.parse(source);
  return ok(tokens);
}

export function tryParseGLSLRaw<T>(
  tokens: Token<TokenKind> | undefined,
  parser: Parser<TokenKind, T>
) {
  const result = expectSingleResult(expectEOF(parser.parse(tokens)));
  return result;
}

export function parseWith<T>(str: string, parser: Parser<TokenKind, T>) {
  return tryParseGLSLRaw(lexGLSL(str).unsafeExpectSuccess(), parser);
}

export function parseGLSLFragmentWithoutPreprocessing<T>(
  source: string,
  parser: Parser<TokenKind, T>
): Result<T, ParserError> {
  const tokens = lexGLSL(source);

  if (!tokens.data.success) return err(tokens.data.error);

  try {
    const data = expectSingleResult(expectEOF(parser.parse(tokens.data.data)));

    return ok(data);
  } catch (error) {
    return err({ why: (error ?? "").toString() });
  }
}

export function parseGLSLWithoutPreprocessing(
  source: string
): Result<ParserResult, ParserError> {
  const tokens = lexGLSL(source);

  if (!tokens.data.success) return err(tokens.data.error);

  try {
    const translationUnit = expectSingleResult(
      expectEOF(translation_unit.parse(tokens.data.data))
    );

    return ok({
      translationUnit,
    });
  } catch (error) {
    return err({ why: (error ?? "").toString() });
  }
}
