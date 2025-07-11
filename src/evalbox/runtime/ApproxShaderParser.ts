namespace Token {
  export type Keyword = "in" | "out" | "uniform";
  export type TypeName =
    | "int"
    | "float"
    | `${"" | "i" | "u"}vec${"2" | "3" | "4"}`;
  export type Whitespace = " " | "\n" | "\r" | "\t";

  export type Lowercase =
    | "a"
    | "b"
    | "c"
    | "d"
    | "e"
    | "f"
    | "g"
    | "h"
    | "i"
    | "j"
    | "k"
    | "l"
    | "m"
    | "n"
    | "o"
    | "p"
    | "q"
    | "r"
    | "s"
    | "t"
    | "u"
    | "v"
    | "w"
    | "x"
    | "y"
    | "z";

  export type Letters = Lowercase | Uppercase<Lowercase>;

  export type Numbers =
    | "1"
    | "2"
    | "3"
    | "4"
    | "5"
    | "6"
    | "7"
    | "8"
    | "9"
    | "0";

  export type Identifiers = Letters | Numbers | "_";
}

type ParseIdentifier<Input extends string> = ParseLettersHelper<
  Input,
  ""
> extends [`${infer Letters}`, `${infer Remainder}`]
  ? Letters extends ""
    ? undefined
    : [Letters, Remainder]
  : ParseLettersHelper<Input, "">;

type ParseLettersHelper<
  Input extends string,
  Acc extends string
> = Input extends `${infer L}${infer Remainder}`
  ? L extends Token.Identifiers
    ? ParseLettersHelper<Remainder, `${Acc}${L}`>
    : [Acc, Input]
  : [Acc, ""];

type EatWhitespace<Input extends string> =
  Input extends `${Token.Whitespace}${infer Remainder}`
    ? EatWhitespace<Remainder>
    : Input;

// type MeaningfulStatement<Input extends string> =
//   Input extends `${infer Keyword extends
//     | Token.In
//     | Token.Out
//     | Token.Uniform}${infer Remainder}`
//     ? EatWhitespace<Remainder> extends `${infer TypeName extends Token.TypeName}${infer Remainder}`
//       ? ParseIdentifier<EatWhitespace<Remainder>> extends [
//           `${infer Identifier}`,
//           `${infer Remainder}`
//         ]
//         ? {
//             keyword: Keyword;
//             type: TypeName;
//             name: Identifier;
//           }
//         : undefined
//       : undefined
//     : undefined;

type ParseSequenceHelper<
  Input extends string,
  Match extends string
> = Match extends `${infer M}${infer MatchRemainder}`
  ? Input extends `${infer C extends M}${infer Remainder}`
    ? ParseSequenceHelper<Remainder, MatchRemainder>
    : undefined
  : Input;

type ParseSequence<
  Input extends string,
  Match extends string
> = ParseSequenceHelper<Input, Match> extends `${infer Rest}`
  ? [Match, Rest]
  : ["", Input];

type ParseAltStrings<
  Input extends string,
  Matches extends string[]
> = Matches extends [
  infer Match extends string,
  ...infer RestMatches extends string[]
]
  ? ParseSequence<Input, Match> extends [infer Str, infer Rest]
    ? Str extends ""
      ? ParseAltStrings<Input, RestMatches>
      : [Str, Rest]
    : never
  : ["", Input];

// type MeaningfulStatement<Input extends string> = ParseAltStrings<
//   Input,
//   ["uniform", "in", "out"]
// > extends [infer Keyword extends Token.Keyword, infer Rest]
//   ?
//   EatWhitespace<Rest>
//   {
//       keyword: Keyword;
//     }
//   : ["", Input];

// type Test1 = MeaningfulStatement<"out int test">;
