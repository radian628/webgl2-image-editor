import { Parser } from "typescript-parsec";
import { TokenKind } from "../parser/lexer";
import { expression } from "../parser/parser";
import { lexGLSL, tryParseGLSLRaw } from "../parser/parser-combined";
import { makeFancyFormatter } from "./fmt-fancy";
import { FormatGLSLPacked } from "./fmt-packed";
import { test, expect } from "bun:test";

function testFancyRoundtrip<T>(
  src: string,
  parser: Parser<TokenKind, T>,
  packed: (t: T) => string,
  fancy: (t: T) => string
) {
  test(`fancyfmt: ${src}`, () => {
    const tokens = lexGLSL(src).unsafeExpectSuccess();
    const parsed = tryParseGLSLRaw(tokens, parser);
    const packedSrc = packed(parsed);

    const tokens2 = lexGLSL(packedSrc).unsafeExpectSuccess();
    const parsed2 = tryParseGLSLRaw(tokens2, parser);
    const fancySrc = fancy(parsed2);

    expect(src).toBe(fancySrc);
  });
}

const fancyFormatter = makeFancyFormatter(Infinity);

function expr(src: string) {
  return testFancyRoundtrip(
    src,
    expression,
    FormatGLSLPacked.exprmax,
    fancyFormatter.exprmax.bind(fancyFormatter)
  );
}

expr("1");
expr("1 + 1");
expr("true");
expr("false");
expr("f(1, 2, 3)");
expr("1 ? 2 : 3");
