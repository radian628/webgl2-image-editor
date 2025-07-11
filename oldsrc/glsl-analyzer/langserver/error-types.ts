// TODO: actually distinguish and detect these errors

type GrammarErrorCode = "G0001" | "G0002" | "G0003" | "G0004" | "G0005";
type SemanticErrorCode = Exclude<
  | `S00${"0" | "1" | "2" | "3" | "4" | "5"}${
      | "0"
      | "1"
      | "2"
      | "3"
      | "4"
      | "5"
      | "6"
      | "7"
      | "8"
      | "9"}`
  | "S0060",
  "S0000"
>;

type ErrorCode = GrammarErrorCode | SemanticErrorCode;
