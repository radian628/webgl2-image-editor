import { apply, Parser, str } from "typescript-parsec";
import { TokenKind } from "./lexer";

export function lstr<T extends string>(s: T): Parser<TokenKind, T> {
  return apply(str(s), (s) => s.text as T);
}
