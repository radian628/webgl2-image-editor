const chars = (s: string) => s.split("").map((e) => [e]);

const opt = <T>(s: string | T) =>
  ({ type: "opt", symbol: s } as FuzzerToken<T>);

// integers
export const integer_constant = Symbol("integer_constant");

const integer_suffix = Symbol("integer_suffix");

const decimal_constant = Symbol("decimal_constant");

const octal_constant = Symbol("octal_constant");

const hexadecimal_constant = Symbol("hexadecimal_constant");

const digit = Symbol("digit");

const nonzero_digit = Symbol("nonzero_digit");

const octal_digit = Symbol("octal_digit");

const hexadecimal_digit = Symbol("hexadecimal_digit");

export const glslIntFuzzer = {
  // integers
  [integer_constant]: [
    [decimal_constant, opt(integer_suffix)],
    [octal_constant, opt(integer_suffix)],
    [hexadecimal_constant, opt(integer_suffix)],
  ],

  [integer_suffix]: chars("uU"),

  [decimal_constant]: [[nonzero_digit], [decimal_constant, digit]],

  [octal_constant]: [["0"], [octal_constant, octal_digit]],

  [hexadecimal_constant]: [
    ["0x", hexadecimal_digit],
    ["0X", hexadecimal_digit],
    [hexadecimal_constant, hexadecimal_digit],
  ],

  [digit]: [["0"], [digit]],

  [nonzero_digit]: chars("123456789"),

  [octal_digit]: chars("01234567"),

  [hexadecimal_digit]: chars("0123456789abcdefABCDEF"),
} satisfies Fuzzer<symbol>;

const INTEGERCONSTANT = {
  type: "fuzzer" as "fuzzer",
  expand: (prng: () => number) =>
    fuzz(glslIntFuzzer, prng, 10, integer_constant).join(""),
};

// floating point
const floating_constant = Symbol("floating_constant");

const fractional_constant = Symbol("fractional_constant");

const exponent_part = Symbol("exponent_part");

const sign = Symbol("sign");

const digit_sequence = Symbol("digit_sequence");

const floating_suffix = Symbol("floating_suffix");

const glslFloatFuzzer = {
  // floating point
  [floating_constant]: [
    [fractional_constant, opt(exponent_part), opt(floating_suffix)],
    [digit_sequence, exponent_part, opt(floating_suffix)],
  ],

  [fractional_constant]: [
    [digit_sequence, ".", digit_sequence],
    [digit_sequence, "."],
    [".", digit_sequence],
  ],

  [exponent_part]: [
    ["e", opt(sign), digit_sequence],
    ["E", opt(sign), digit_sequence],
  ],

  [sign]: chars("+-"),

  [digit_sequence]: [[digit], [digit_sequence, digit]],

  [floating_suffix]: chars("fF"),
} satisfies Fuzzer<symbol>;

const FLOATCONSTANT = {
  type: "fuzzer" as "fuzzer",
  expand: (prng: () => number) =>
    fuzz(glslFloatFuzzer, prng, 40, floating_constant).join(""),
};

// identifier
const identifier = Symbol("identifier");

const nondigit = Symbol("nondigit");

const glslIdentifierFuzzer = {
  [identifier]: [[nondigit], [identifier, nondigit], [identifier, digit]],

  [nondigit]: chars("_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"),

  [digit]: chars("0123456789"),
};

const IDENTIFIER = {
  type: "fuzzer" as "fuzzer",
  expand: (prng: () => number) =>
    fuzz(glslIdentifierFuzzer, prng, 10, identifier).join(""),
};

// grammar
/*
.split("\n").filter(l => l.match(/^[a-zA-Z_]+:/g)).map(e => e.slice(0, -1)).map(e => `const ${e} = Symbol("${e}")`).join("\n\n")
*/

const variable_identifier = Symbol("variable_identifier");

export const primary_expression = Symbol("primary_expression");

const postfix_expression = Symbol("postfix_expression");

const integer_expression = Symbol("integer_expression");

const function_call = Symbol("function_call");

const function_call_or_method = Symbol("function_call_or_method");

const function_call_generic = Symbol("function_call_generic");

const function_call_header_no_parameters = Symbol(
  "function_call_header_no_parameters"
);

const function_call_header_with_parameters = Symbol(
  "function_call_header_with_parameters"
);

const function_call_header = Symbol("function_call_header");

const function_identifier = Symbol("function_identifier");

const unary_expression = Symbol("unary_expression");

const unary_operator = Symbol("unary_operator");

const multiplicative_expression = Symbol("multiplicative_expression");

const additive_expression = Symbol("additive_expression");

const shift_expression = Symbol("shift_expression");

const relational_expression = Symbol("relational_expression");

const equality_expression = Symbol("equality_expression");

const and_expression = Symbol("and_expression");

const exclusive_or_expression = Symbol("exclusive_or_expression");

const inclusive_or_expression = Symbol("inclusive_or_expression");

const logical_and_expression = Symbol("logical_and_expression");

const logical_xor_expression = Symbol("logical_xor_expression");

const logical_or_expression = Symbol("logical_or_expression");

const conditional_expression = Symbol("conditional_expression");

const assignment_expression = Symbol("assignment_expression");

const assignment_operator = Symbol("assignment_operator");

export const expression = Symbol("expression");

const constant_expression = Symbol("constant_expression");

const declaration = Symbol("declaration");

const function_prototype = Symbol("function_prototype");

const function_declarator = Symbol("function_declarator");

const function_header_with_parameters = Symbol(
  "function_header_with_parameters"
);

const function_header = Symbol("function_header");

const parameter_declarator = Symbol("parameter_declarator");

const parameter_declaration = Symbol("parameter_declaration");

const parameter_qualifier = Symbol("parameter_qualifier");

const parameter_type_specifier = Symbol("parameter_type_specifier");

const init_declarator_list = Symbol("init_declarator_list");

const single_declaration = Symbol("single_declaration");

const fully_specified_type = Symbol("fully_specified_type");

const invariant_qualifier = Symbol("invariant_qualifier");

const interpolation_qualifier = Symbol("interpolation_qualifier");

const layout_qualifier = Symbol("layout_qualifier");

const layout_qualifier_id_list = Symbol("layout_qualifier_id_list");

const layout_qualifier_id = Symbol("layout_qualifier_id");

const parameter_type_qualifier = Symbol("parameter_type_qualifier");

const type_qualifier = Symbol("type_qualifier");

const storage_qualifier = Symbol("storage_qualifier");

const type_specifier = Symbol("type_specifier");

const type_specifier_no_prec = Symbol("type_specifier_no_prec");

const type_specifier_nonarray = Symbol("type_specifier_nonarray");

const precision_qualifier = Symbol("precision_qualifier");

const struct_specifier = Symbol("struct_specifier");

const struct_declaration_list = Symbol("struct_declaration_list");

const struct_declaration = Symbol("struct_declaration");

const struct_declarator_list = Symbol("struct_declarator_list");

const struct_declarator = Symbol("struct_declarator");

const initializer = Symbol("initializer");

const declaration_statement = Symbol("declaration_statement");

const statement = Symbol("statement");

const statement_no_new_scope = Symbol("statement_no_new_scope");

const statement_with_scope = Symbol("statement_with_scope");

const simple_statement = Symbol("simple_statement");

const compound_statement_with_scope = Symbol("compound_statement_with_scope");

const compound_statement_no_new_scope = Symbol(
  "compound_statement_no_new_scope"
);

const statement_list = Symbol("statement_list");

const expression_statement = Symbol("expression_statement");

const selection_statement = Symbol("selection_statement");

const selection_rest_statement = Symbol("selection_rest_statement");

const condition = Symbol("condition");

const switch_statement = Symbol("switch_statement");

const switch_statement_list = Symbol("switch_statement_list");

const case_label = Symbol("case_label");

const iteration_statement = Symbol("iteration_statement");

const for_init_statement = Symbol("for_init_statement");

const conditionopt = Symbol("conditionopt");

const for_rest_statement = Symbol("for_rest_statement");

const jump_statement = Symbol("jump_statement");

const translation_unit = Symbol("translation_unit");

const external_declaration = Symbol("external_declaration");

const function_definition = Symbol("function_definition");

function binop(lowerPrec: symbol, myPrec: symbol, ops: string[]) {
  return [[lowerPrec], ...ops.map((op) => [myPrec, op, lowerPrec])];
}

export const glslFuzzer = {
  [variable_identifier]: [[IDENTIFIER]],

  [primary_expression]: [
    [variable_identifier],
    [INTEGERCONSTANT],
    [FLOATCONSTANT],
    ["true"],
    ["false"],
    ["(", expression, ")"],
  ],

  [postfix_expression]: [
    [primary_expression],
    [postfix_expression, "[", integer_expression, "]"],
    [function_call],
    [postfix_expression, ".", IDENTIFIER],
    [postfix_expression, "++"],
    [postfix_expression, "--"],
  ],

  [integer_expression]: [[expression]],

  [function_call]: [[function_call_or_method]],

  [function_call_or_method]: [
    [function_call_generic],
    [postfix_expression, ".", function_call_generic],
  ],

  [function_call_generic]: [
    [function_call_header_with_parameters, ")"],
    [function_call_header_no_parameters, ")"],
  ],

  [function_call_header_no_parameters]: [
    [function_call_header, "void"],
    [function_call_header],
  ],

  [function_call_header_with_parameters]: [
    [function_call_header, assignment_expression],
    [function_call_header_with_parameters, ",", assignment_expression],
  ],

  [function_call_header]: [[function_identifier, "("]],

  [function_identifier]: [[IDENTIFIER]],

  [unary_expression]: [
    [postfix_expression],
    ["++", unary_expression],
    ["--", unary_expression],
    [unary_operator, unary_expression],
  ],

  [unary_operator]: [["+"], ["-"], ["!"], ["~"]],

  [multiplicative_expression]: binop(
    unary_expression,
    multiplicative_expression,
    ["*", "/", "%"]
  ),

  [additive_expression]: binop(multiplicative_expression, additive_expression, [
    "+",
    "-",
  ]),

  [shift_expression]: binop(additive_expression, shift_expression, [
    "<<",
    ">>",
  ]),

  [relational_expression]: binop(shift_expression, relational_expression, [
    ">",
    "<",
    ">=",
    "<=",
  ]),

  [equality_expression]: binop(relational_expression, equality_expression, [
    "==",
    "!=",
  ]),

  [and_expression]: binop(equality_expression, and_expression, ["&"]),

  [exclusive_or_expression]: binop(and_expression, exclusive_or_expression, [
    "^",
  ]),

  [inclusive_or_expression]: binop(
    exclusive_or_expression,
    inclusive_or_expression,
    ["|"]
  ),

  [logical_and_expression]: binop(
    inclusive_or_expression,
    logical_and_expression,
    ["&&"]
  ),

  [logical_xor_expression]: binop(
    logical_and_expression,
    logical_xor_expression,
    ["^^"]
  ),

  [logical_or_expression]: binop(
    logical_xor_expression,
    logical_or_expression,
    ["||"]
  ),

  [conditional_expression]: [
    [logical_or_expression],
    [logical_or_expression, "?", expression, ":", assignment_expression],
  ],

  [assignment_expression]: [
    [conditional_expression],
    [unary_expression, assignment_operator, assignment_expression],
  ],

  [assignment_operator]: [
    ["="],
    ["*="],
    ["/="],
    ["%="],
    ["+="],
    ["-="],
    ["<<="],
    [">>="],
    ["&="],
    ["^="],
    ["|="],
  ],

  [expression]: [
    [assignment_expression],
    [expression, ",", assignment_expression],
  ],

  [constant_expression]: [[conditional_expression]],
} satisfies Fuzzer<symbol>;

type FuzzerToken<T> =
  | string
  | T
  | { type: "opt"; symbol: FuzzerToken<T> }
  | { type: "fuzzer"; expand: (prng: () => number) => string };

type Fuzzer<T extends symbol> = Record<T, FuzzerToken<T>[][]>;

export function fuzz<T extends symbol>(
  fuzzer: Fuzzer<T>,
  prng: () => number,
  stopExpandingAt: number,
  init: T
) {
  let tokens: FuzzerToken<T>[] = [init];
  let hasNonterminals = true;
  while (hasNonterminals) {
    hasNonterminals = false;

    let newTokens: FuzzerToken<T>[] = [];
    for (const tok of tokens) {
      function handleFuzzerToken(tok: FuzzerToken<T>) {
        // terminal
        if (typeof tok === "string") {
          newTokens.push(tok);
          return;
        }

        hasNonterminals = true;

        // simple nonterminal
        if (typeof tok === "symbol") {
          let replacements = fuzzer[tok] as FuzzerToken<T>[][];

          // restrict replacements to terminal symbols if possible, if over the token limit
          if (tokens.length > stopExpandingAt) {
            let oldReplacements = replacements;
            replacements = replacements.filter((r) =>
              r.every((s) => typeof s === "string")
            );
            if (replacements.length === 0) replacements = oldReplacements;
          }

          // add new expanded tokens
          newTokens.push(
            ...replacements[Math.floor(prng() * replacements.length)]
          );
          return;
        }

        // make typescript not complain
        if (typeof tok !== "object") return;

        if (tok.type === "opt") {
          if (prng() > 0.5) handleFuzzerToken(tok.symbol);
          return;
        }

        newTokens.push(tok.expand(prng));
      }

      handleFuzzerToken(tok);
    }

    tokens = newTokens;
  }

  return tokens as string[];
}
