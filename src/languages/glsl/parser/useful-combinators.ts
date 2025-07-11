import {
  alt_sc,
  apply,
  combine,
  kleft,
  kright,
  nil,
  opt_sc,
  Parser,
  ParserOutput,
  str,
  succ,
} from "typescript-parsec";
import { TokenKind } from "./lexer";
import { ASTNode, Expr, Stmt } from "./parser";
import { nodeify } from "./interleave-comments";

export function lstr<T extends string>(s: T): Parser<TokenKind, T> {
  return apply(str(s), (s) => s.text as T);
}

export function errExprFallback(
  parser: Parser<TokenKind, ASTNode<Expr>>,
  err: string,
  parseAfter?: Parser<TokenKind, any>,
  errParser?: Parser<TokenKind, Expr>
) {
  return alt_sc(
    parser,
    nodeify(
      kleft(
        errParser
          ? errParser
          : apply(nil(), (): Expr => {
              return {
                type: "error",
                errorType: "expr",
                _isExpr: true,
                _isError: true,
                why: err,
              };
            }),
        parseAfter ?? nil()
      )
    )
  );
}

export function errStmtFallback(
  parser: Parser<TokenKind, ASTNode<Stmt>>,
  err: string,
  parseAfter?: Parser<TokenKind, any>,
  errParser?: Parser<TokenKind, Stmt>
) {
  return alt_sc(
    parser,
    nodeify(
      kleft(
        errParser
          ? errParser
          : apply(nil(), (): Stmt => {
              return {
                type: "error",
                errorType: "stmt",
                _isStmt: true,
                _isError: true,
                why: err,
              };
            }),
        parseAfter ?? nil()
      )
    )
  );
}

export function failOnErrExpr(
  parser: Parser<TokenKind, ASTNode<Expr>>
): Parser<TokenKind, ASTNode<Expr>> {
  return {
    parse(tok) {
      const parsed = parser.parse(tok);
      if (parsed.successful) {
        const res = parsed.candidates[0];
        if (res.result.data.type === "error") {
          return {
            successful: false,
            error: {
              kind: "Error",
              pos: tok?.pos,
              message: "",
            },
          };
        } else {
          return parsed;
        }
      } else {
        return parsed;
      }
    },
  };
}

export function fail_if<T>(
  parser: Parser<TokenKind, T>,
  fail: Parser<TokenKind, any>
): Parser<TokenKind, T> {
  return {
    parse(tok): ParserOutput<TokenKind, T> {
      const parsed = parser.parse(tok);
      const shouldFail = fail.parse(tok);

      if (!parsed.successful) return parsed;

      if (shouldFail.successful) {
        const failPos =
          shouldFail.candidates[0].nextToken?.pos?.index ?? Infinity;
        const successPos =
          parsed.candidates[0].nextToken?.pos?.index ?? Infinity;

        if (failPos >= successPos) {
          return {
            successful: false,
            error: {
              kind: "Error",
              message: "Matched failure check parser.",
              pos: tok?.pos,
            },
          };
        }
      }

      return parsed;
    },
  };
}

export function consumeUntil(
  parser: Parser<TokenKind, any>,
  after?: Parser<TokenKind, any>
): Parser<TokenKind, undefined> {
  return combine(
    alt_sc(
      parser,
      after
        ? {
            parse(tok): ParserOutput<TokenKind, boolean> {
              const afterResult = after.parse(tok);
              if (afterResult.successful) {
                return {
                  ...afterResult,
                  candidates: afterResult.candidates.map((c) => ({
                    firstToken: c.firstToken,
                    nextToken: c.firstToken,
                    result: true,
                  })),
                };
              } else {
                return {
                  candidates: [
                    {
                      firstToken: tok,
                      nextToken: tok,
                      result: false,
                    },
                  ],
                  successful: true,
                  error: undefined,
                };
              }
            },
          }
        : nil()
    ),
    (t) =>
      t
        ? // if we've found the pattern, stop
          nil()
        : // otherwise, consume a token
          {
            parse(tok): ParserOutput<TokenKind, boolean> {
              if (tok) {
                return {
                  successful: true,
                  candidates: [
                    {
                      firstToken: tok,
                      nextToken: tok.next,
                      result: true,
                    },
                  ],
                  error: undefined,
                };
              } else {
                return {
                  successful: true,
                  candidates: [
                    {
                      firstToken: tok,
                      nextToken: tok,
                      result: false,
                    },
                  ],
                  error: undefined,
                };
              }
            },
          },
    // if we were able to consume a token, try to find the pattern again
    // otherwise just stop
    (t) => (t ? consumeUntil(parser, after) : nil())
  );
}
