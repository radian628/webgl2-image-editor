import {
  alt_sc,
  apply,
  kleft,
  kmid,
  kright,
  lrec_sc,
  nil,
  opt_sc,
  Parser,
  rep_sc,
  rule,
  seq,
  str,
  tok,
} from "typescript-parsec";
import { TokenKind } from "./lexer";
import {
  add_comments,
  add_comments_and_transform,
  append_comments,
  binop,
  binop_generic,
  comment_parser,
  commentify,
  commentify_no_comments_before,
  custom_node,
  nodeify,
  nodeify_commented,
  stretch_node,
  with_comment_before,
} from "./interleave-comments";
import { lstr } from "./useful-combinators";

// check the grammar in the GL ES specification
// https://registry.khronos.org/OpenGL/specs/es/3.0/GLSL_ES_Specification_3.00.pdf

type ErrorExpr = {
  type: "error";
  why: string;
  _isExpr: true;
};

type IntExpr = {
  type: "int";
  int: number;
  asString: string; // need this so autoformatter doesn't change the number
  _isExpr: true;
};

type FloatExpr = {
  type: "float";
  float: number;
  asString: string; // need this so autoformatter doesn't change the number
  _isExpr: true;
};

type BoolExpr = {
  type: "bool";
  bool: boolean;
  _isExpr: true;
};

type VariableExpr = {
  type: "ident";
  ident: string;
  _isExpr: true;
};

type ConditionalExpr = {
  type: "conditional";
  condition: ASTNode<Expr>;
  ifTrue: ASTNode<Expr>;
  ifFalse: ASTNode<Expr>;
  _isExpr: true;
};

export type Comment = {
  comment: string;
};

export type BinaryOpExpr = {
  type: "binary-op";
  left: ASTNode<Expr>;
  right: ASTNode<Expr>;
  op: // arithmetic
  | "+"
    | "-"
    | "*"
    | "/"
    | "%"
    // comparison
    | "=="
    | "!="
    | ">"
    | "<"
    | ">="
    | "<="
    // logical
    | "&&"
    | "||"
    | "^^"
    // array access
    | "[]"
    // bitwise
    | "&"
    | "^"
    | "|"
    | ">>"
    | "<<"
    // other
    | ",";
  _isExpr: true;
};

type AssignmentExpr = {
  type: "assignment";
  left: ASTNode<Expr>;
  right: ASTNode<Expr>;
  op: AssignmentOperator;
  _isExpr: true;
};

type UnaryOpExpr = {
  type: "unary-op";
  left: ASTNode<Expr>;
  op: "++" | "--" | "!" | "~";
  isAfter: boolean;
  _isExpr: true;
};

type FieldAccessExpr = {
  type: "field-access";
  left: ASTNode<Expr>;
  right: ASTNode<Expr>;
  _isExpr: true;
};

type FunctionCallExpr = {
  type: "function-call";
  identifier: FunctionIdentifier;
  args: ASTNode<Expr>[];
  isVoid: boolean;
  _isExpr: true;
};

type FunctionCallFieldAccessExpr = {
  type: "function-call-field-access";
  left: ASTNode<Expr>;
  right: ASTNode<Expr>;
  _isExpr: true;
};

export type Expr =
  | ErrorExpr
  | IntExpr
  | FloatExpr
  | BoolExpr
  | VariableExpr
  | BinaryOpExpr
  | UnaryOpExpr
  | FieldAccessExpr
  | FunctionCallExpr
  | FunctionCallFieldAccessExpr
  | ConditionalExpr
  | AssignmentExpr;

export type ExprStmt = {
  type: "expr";
  expr?: ASTNode<Expr>;
  _isStmt: true;
};

export type SwitchStmt = {
  type: "switch";
  expr: ASTNode<Expr>;
  stmts: ASTNode<Stmt>[];
  _isStmt: true;
};

export type CaseLabelStmt = {
  type: "case";
  expr: ASTNode<Expr>;
  _isStmt: true;
};

export type DefaultCaseLabelStmt = {
  type: "default-case";
  _isStmt: true;
};

export type JumpStmt = {
  type: "continue" | "break" | "discard";
  _isStmt: true;
};

export type ReturnStmt = {
  type: "return";
  expr?: ASTNode<Expr>;
  _isStmt: true;
};

export type DeclarationStmt = {
  type: "declaration";
  decl: Commented<Declaration>;
  _isStmt: true;
};

export type CompoundStmt = {
  statements: ASTNode<Stmt>[];
  type: "compound";
  _isStmt: true;
};

export type SelectionStmt = {
  cond: ASTNode<Expr>;
  rest: Commented<SelectionRestStmt>;
  type: "selection";
  _isStmt: true;
};

export type SelectionRestStmt = {
  if: ASTNode<Stmt>;
  else?: ASTNode<Stmt>;
  _isStmt: true;
};

export type IterationStmt =
  | {
      type: "while";
      cond: Commented<Condition>;
      body: ASTNode<Stmt>;
      _isStmt: true;
    }
  | {
      type: "do-while";
      cond: ASTNode<Expr>;
      body: ASTNode<Stmt>;
      _isStmt: true;
    }
  | {
      type: "for";
      init: ASTNode<Stmt>;
      rest: Commented<ForRestStatement>;
      body: ASTNode<Stmt>;
      _isStmt: true;
    };

export type Stmt =
  | ExprStmt
  | SwitchStmt
  | CaseLabelStmt
  | DefaultCaseLabelStmt
  | JumpStmt
  | ReturnStmt
  | DeclarationStmt
  | CompoundStmt
  | SelectionStmt
  | IterationStmt;

export type ExternalDeclarationFunction = {
  type: "function";
  prototype: Commented<FunctionHeader>;
  body: ASTNode<CompoundStmt>;
  _isExtDecl: true;
};

export type ExternalDeclarationDeclaration = {
  type: "declaration";
  decl: Commented<Declaration>;
  _isExtDecl: true;
};

export type ExternalDeclaration =
  | ExternalDeclarationFunction
  | ExternalDeclarationDeclaration;

export type ASTNode<T> = {
  data: T;
  // outer array to account for different spots comments can appear in
  // inner array to list comments
  comments: Comment[][];
  range: { start: number; end: number };
  _isNode: true;
};

// wrapper for comments
export type Commented<T> = {
  data: T;
  comments: Comment[][];
};

export type Declaration =
  | {
      type: "function-prototype";
      prototype: Commented<FunctionHeader>;
      _isDecl: true;
    }
  | {
      type: "declarator-list";
      declaratorList: Commented<InitDeclaratorList>;
      _isDecl: true;
    }
  | {
      type: "type-specifier";
      precision: Commented<Precision>;
      specifier: Commented<TypeNoPrec>;
      _isDecl: true;
    }
  | {
      type: "struct";
      typeQualifier: Commented<TypeQualifier>;
      name: Commented<string>;
      name2?: Commented<string>;
      declarationList: Commented<StructDeclarationList>;
      constantExpr?: ASTNode<Expr>;
      _isDecl: true;
    }
  | {
      type: "type-qualifier";
      typeQualifier: Commented<TypeQualifier>;
      _isDecl: true;
    };

export type FunctionIdentifier =
  | {
      type: "function-identifier";
      identifier: string;
    }
  | TypeSpecifier;

export type TypeSpecifier = {
  type: "type-specifier";
  precision?: Commented<Precision>;
  specifier: Commented<TypeNoPrec>;
};

export type TypeNoPrec = {
  typeName: Commented<TypeSpecifierNonarray>;
  // for if this is an array
  arrayType:
    | {
        type: "static";
        size: ASTNode<Expr>;
      }
    | {
        type: "dynamic";
      }
    | { type: "none" };
};

export type TypeSpecifierNonarray =
  | {
      type: "builtin";
      name: Commented<string>;
    }
  | {
      type: "struct";
      struct: Commented<StructSpecifier>;
    }
  | {
      type: "custom";
      name: Commented<string>;
    };

export type TypeQualifier =
  | {
      type: "sq";
      storageQualifier: Commented<StorageQualifier>;
    }
  | {
      type: "lq-sq";
      layoutQualifier: Commented<LayoutQualifier>;
      storageQualifier?: Commented<StorageQualifier>;
    }
  | {
      type: "intq-sq";
      interpolationQualifier: Commented<InterpolationQualifier>;
      storageQualifier?: Commented<StorageQualifier>;
    }
  | {
      type: "invq-intq-sq";
      invariantQualifier: Commented<InvariantQualifier>;
      interpolationQualifier?: Commented<InterpolationQualifier>;
      storageQualifier: Commented<StorageQualifier>;
    };

export type LayoutQualifier = Commented<LayoutQualifierId>[];

export type InvariantQualifier = "invariant";

export type InterpolationQualifier = "smooth" | "flat";

export type StorageQualifier =
  | "const"
  | "in"
  | "out"
  | "centroid in"
  | "centroid out"
  | "uniform";

export type Precision = "lowp" | "mediump" | "highp";

export type AssignmentOperator =
  | "="
  | "*="
  | "/="
  | "%="
  | "+="
  | "-="
  | "<<="
  | ">>="
  | "&="
  | "^="
  | "|=";

export type LayoutQualifierId = {
  identifier: string;
  value?: number;
};

export type InitDeclaratorList = {
  init: Commented<SingleDeclarationStart>;
  declarations: Commented<Commented<SingleDeclaration>[]>;
};

export type SingleDeclarationVariant =
  | {
      type: "sized-array";
      size: ASTNode<Expr>;
    }
  | {
      type: "initialized-array";
      size?: ASTNode<Expr>;
      initializer: ASTNode<Expr>;
    }
  | {
      type: "initialized";
      initializer: ASTNode<Expr>;
    };

export type SingleDeclaration = {
  name: Commented<string>;
  variant?: Commented<SingleDeclarationVariant>;
};

export type SingleDeclarationStart =
  | {
      type: "type";
      declType: Commented<FullySpecifiedType>;
    }
  | {
      type: "invariant";
    };

export type FullySpecifiedType = {
  specifier: Commented<TypeSpecifier>;
  qualifier?: Commented<TypeQualifier>;
};

export type ParameterTypeQualifier = "const";

export type ParameterQualifier = "in" | "out" | "inout";

export type ParameterTypeSpecifier = TypeSpecifier;

export type ParameterDeclarator = {
  typeSpecifier: Commented<TypeSpecifier>;
  identifier: Commented<string>;
  arraySize?: ASTNode<Expr>;
};

export type FunctionHeader = {
  fullySpecifiedType: Commented<FullySpecifiedType>;
  name: Commented<string>;
  parameters?: Commented<Commented<ParameterDeclaration>[]>;
};

export type ParameterDeclaration = {
  parameterTypeQualifier?: Commented<ParameterTypeQualifier>;
  parameterQualifier?: Commented<ParameterQualifier>;
  declaratorOrSpecifier:
    | {
        type: "declarator";
        declarator: Commented<ParameterDeclarator>;
      }
    | {
        type: "specifier";
        specifier: Commented<ParameterTypeSpecifier>;
      };
};

export type StructSpecifier = {
  members: Commented<StructDeclarationList>;
  name?: Commented<string>;
  _isStruct: true;
};

export type StructDeclarationList = Commented<StructDeclaration>[];

export type StructDeclaration = {
  typeQualifier?: Commented<TypeQualifier>;
  typeSpecifier: Commented<TypeSpecifier>;
  declaratorList: Commented<StructDeclaratorList>;
};

export type StructDeclaratorList = Commented<StructDeclarator>[];

export type StructDeclarator = {
  name: string;
  isArray?: {
    expr?: ASTNode<Expr>;
  };
};

export type ForRestStatement = {
  condition?: Commented<Condition>;
  expr?: ASTNode<Expr>;
};

export type Condition =
  | {
      type: "expr";
      expr: ASTNode<Expr>;
    }
  | {
      type: "type-equal-init";
      fullySpecifiedType: Commented<FullySpecifiedType>;
      name: Commented<string>;
      initializer: ASTNode<Expr>;
    };

function glslParseInt(str: string): number {
  throw new Error("TODO");
}

export type TranslationUnit = Commented<ASTNode<ExternalDeclaration>[]>;

const variable_identifier = rule<TokenKind, ASTNode<Expr>>();
export const primary_expression = rule<TokenKind, ASTNode<Expr>>();
export const postfix_expression = rule<TokenKind, ASTNode<Expr>>();
export const integer_expression = rule<TokenKind, ASTNode<Expr>>();
export const function_call = rule<TokenKind, ASTNode<Expr>>();
const function_call_or_method = rule<TokenKind, ASTNode<Expr>>();
export const function_call_generic = rule<
  TokenKind,
  ASTNode<FunctionCallExpr>
>();
export const function_call_header_no_parameters = rule<
  TokenKind,
  Commented<FunctionCallExpr>
>();
export const function_call_header_with_parameters = rule<
  TokenKind,
  Commented<FunctionCallExpr>
>();
export const function_call_header = rule<
  TokenKind,
  Commented<FunctionIdentifier>
>();
const function_identifier = rule<TokenKind, Commented<FunctionIdentifier>>();
export const unary_expression = rule<TokenKind, ASTNode<Expr>>();
const unary_operator = rule<TokenKind, ASTNode<Expr>>();
export const multiplicative_expression = rule<TokenKind, ASTNode<Expr>>();
const additive_expression = rule<TokenKind, ASTNode<Expr>>();
const shift_expression = rule<TokenKind, ASTNode<Expr>>();
const relational_expression = rule<TokenKind, ASTNode<Expr>>();
const equality_expression = rule<TokenKind, ASTNode<Expr>>();
export const and_expression = rule<TokenKind, ASTNode<Expr>>();
const exclusive_or_expression = rule<TokenKind, ASTNode<Expr>>();
const inclusive_or_expression = rule<TokenKind, ASTNode<Expr>>();
const logical_and_expression = rule<TokenKind, ASTNode<Expr>>();
const logical_xor_expression = rule<TokenKind, ASTNode<Expr>>();
export const logical_or_expression = rule<TokenKind, ASTNode<Expr>>();
const conditional_expression = rule<TokenKind, ASTNode<Expr>>();
export const assignment_expression = rule<TokenKind, ASTNode<Expr>>();
const assignment_operator = rule<TokenKind, AssignmentOperator>();
export const expression = rule<TokenKind, ASTNode<Expr>>();
const constant_expression = rule<TokenKind, ASTNode<Expr>>();
export const declaration = rule<TokenKind, Commented<Declaration>>();
const function_prototype = rule<TokenKind, Commented<FunctionHeader>>();
const function_declarator = rule<TokenKind, Commented<FunctionHeader>>();
const function_header_with_parameters = rule<
  TokenKind,
  Commented<FunctionHeader>
>();
const function_header = rule<TokenKind, Commented<FunctionHeader>>();
const parameter_declarator = rule<TokenKind, Commented<ParameterDeclarator>>();
const parameter_declaration = rule<
  TokenKind,
  Commented<ParameterDeclaration>
>();
const parameter_qualifier = rule<
  TokenKind,
  ASTNode<ParameterQualifier> | undefined
>();
const parameter_type_specifier = rule<TokenKind, Commented<TypeSpecifier>>();
export const init_declarator_list = rule<
  TokenKind,
  Commented<InitDeclaratorList>
>();
const single_declaration = rule<TokenKind, ASTNode<Expr>>();
export const fully_specified_type = rule<
  TokenKind,
  Commented<FullySpecifiedType>
>();
const invariant_qualifier = rule<TokenKind, Commented<InvariantQualifier>>();
const interpolation_qualifier = rule<
  TokenKind,
  Commented<InterpolationQualifier>
>();
export const layout_qualifier = rule<TokenKind, Commented<LayoutQualifier>>();
const layout_qualifier_id_list = rule<TokenKind, Commented<LayoutQualifier>>();
export const layout_qualifier_id = rule<
  TokenKind,
  Commented<LayoutQualifierId>
>();
const parameter_type_qualifier = rule<
  TokenKind,
  Commented<ParameterTypeQualifier>
>();
const type_qualifier = rule<TokenKind, Commented<TypeQualifier>>();
const storage_qualifier = rule<TokenKind, Commented<StorageQualifier>>();
const type_specifier = rule<TokenKind, Commented<TypeSpecifier>>();
const type_specifier_no_prec = rule<TokenKind, Commented<TypeNoPrec>>();
const type_specifier_nonarray = rule<
  TokenKind,
  Commented<TypeSpecifierNonarray>
>();
const precision_qualifier = rule<TokenKind, Commented<Precision>>();
const struct_specifier = rule<TokenKind, Commented<StructSpecifier>>();
const struct_declaration_list = rule<
  TokenKind,
  Commented<StructDeclarationList>
>();
const struct_declaration = rule<TokenKind, Commented<StructDeclaration>>();
const struct_declarator_list = rule<
  TokenKind,
  Commented<StructDeclaratorList>
>();
const struct_declarator = rule<TokenKind, Commented<StructDeclarator>>();
const initializer = rule<TokenKind, ASTNode<Expr>>();
const declaration_statement = rule<TokenKind, ASTNode<Stmt>>();
export const statement = rule<TokenKind, ASTNode<Stmt>>();
const statement_no_new_scope = rule<TokenKind, ASTNode<Stmt>>();
const statement_with_scope = rule<TokenKind, ASTNode<Stmt>>();
const simple_statement = rule<TokenKind, ASTNode<Stmt>>();
const compound_statement_with_scope = rule<TokenKind, ASTNode<CompoundStmt>>();
const compound_statement_no_new_scope = rule<
  TokenKind,
  ASTNode<CompoundStmt>
>();
const statement_list = rule<TokenKind, ASTNode<Stmt>[]>();
const expression_statement = rule<TokenKind, ASTNode<Stmt>>();
const selection_statement = rule<TokenKind, ASTNode<Stmt>>();
const selection_rest_statement = rule<
  TokenKind,
  Commented<SelectionRestStmt>
>();
const condition = rule<TokenKind, Commented<Condition>>();
const switch_statement = rule<TokenKind, ASTNode<Stmt>>();
const switch_statement_list = rule<TokenKind, ASTNode<Stmt>[] | undefined>();
const case_label = rule<TokenKind, ASTNode<Stmt>>();
const iteration_statement = rule<TokenKind, ASTNode<Stmt>>();
const for_init_statement = rule<TokenKind, ASTNode<Stmt>>();
const conditionopt = rule<TokenKind, Commented<Condition> | undefined>();
const for_rest_statement = rule<TokenKind, Commented<ForRestStatement>>();
const jump_statement = rule<TokenKind, ASTNode<Stmt>>();
export const translation_unit = rule<TokenKind, TranslationUnit>();
export const external_declaration = rule<
  TokenKind,
  ASTNode<ExternalDeclaration>
>();
const function_definition = rule<TokenKind, ASTNode<ExternalDeclaration>>();

const placeholder = nodeify(
  apply(nil<TokenKind>(), () => ({
    type: "error" as const,
    why: "Placeholder encountered during parsing!",
  }))
);

variable_identifier.setPattern(
  nodeify(
    apply(tok(TokenKind.Identifier), (s) => ({
      type: "ident",
      ident: s.text,
      _isExpr: true,
    }))
  )
);

primary_expression.setPattern(
  alt_sc(
    // identifier
    variable_identifier,
    nodeify(
      alt_sc(
        // integer literals
        apply(
          alt_sc(
            tok(TokenKind.IntegerDecimal),
            tok(TokenKind.IntegerOctal),
            tok(TokenKind.IntegerHex)
          ),
          (tok) => {
            const num =
              tok.text[0] == "0" ? parseInt(tok.text, 8) : parseInt(tok.text);
            return {
              type: "int",
              int: num,
              asString: tok.text,
              _isExpr: true,
            };
          }
        ),
        // float literal
        apply(tok(TokenKind.Float), (float) => ({
          type: "float",
          float: parseFloat(float.text),
          asString: float.text,
          _isExpr: true,
        })),
        // boolean literal
        apply(alt_sc(str("true"), str("false")), (bool) => ({
          type: "bool",
          bool: bool.text == "true",
          _isExpr: true,
        }))
      )
    ),
    // parenthesized expression
    add_comments(
      seq(comment_parser, str("("), expression, comment_parser, str(")")),
      (t) => t[2],
      (c, oc) => [c[0], ...oc, c[3]]
    )
  )
);

const field_access: Parser<TokenKind, ASTNode<Expr>> =
  // a.b
  binop_generic(
    alt_sc(function_call_generic, primary_expression),
    seq(comment_parser, str("."), comment_parser, postfix_expression),
    (left: ASTNode<Expr>, right) => [
      {
        type: "field-access",
        left,
        right: right[3],
        _isExpr: true,
      },
      [right[0], right[2]],
    ]
  );

postfix_expression.setPattern(
  alt_sc(
    // a[b]
    binop_generic(
      primary_expression,
      seq(
        comment_parser,
        str("["),
        integer_expression,
        comment_parser,
        str("]")
      ),
      (left, right) => [
        {
          left,
          right: right[2],
          type: "binary-op",
          op: "[]",
          _isExpr: true,
        },
        [right[0], right[3]],
      ]
    ),
    // a++, a--
    binop_generic(
      primary_expression,
      seq(comment_parser, alt_sc(str("++"), str("--"))),
      (left, right) => [
        {
          type: "unary-op",
          left,
          op: right[1].text as "++" | "--",
          isAfter: true,
          _isExpr: true,
        },
        [right[0]],
      ]
    ),
    field_access,
    function_call_generic,
    primary_expression
  )
);

integer_expression.setPattern(expression);

function_call.setPattern(function_call_or_method);

function_call_or_method.setPattern(
  // NOTE: THIS DIFFERS FROM THE GRAMMAR!!
  // METHOD CALLS HAVE BEEN MOVED TO postfix_expression
  // TO PREVENT IT FROM DEFAULTING TO PROPERTY ACCESS
  alt_sc(
    function_call_generic,
    binop_generic(
      postfix_expression,
      seq(comment_parser, str("."), function_call_generic),
      (left, right) => [
        {
          type: "function-call-field-access",
          left,
          right: right[2],
          _isExpr: true,
        },
        [right[0]],
      ]
    )
  )
);

function_call_generic.setPattern(
  nodeify_commented(
    append_comments(
      seq(
        alt_sc(
          function_call_header_with_parameters,
          function_call_header_no_parameters
        ),
        comment_parser,
        str(")")
      ),
      (s) => s[0],
      (s) => [s[1]]
    )
  )
);

function_call_header_no_parameters.setPattern(
  add_comments_and_transform(
    seq(function_call_header, opt_sc(seq(comment_parser, str("void")))),
    (s) => s[0],
    (i, s) => ({
      type: "function-call",
      identifier: i,
      isVoid: s[1] !== undefined,
      args: [],
      _isExpr: true,
    }),
    (o, s) => [...o, s[1]?.[0] ?? []]
  )
);

function_call_header_with_parameters.setPattern(
  add_comments_and_transform(
    seq(
      function_call_header,
      assignment_expression,
      rep_sc(seq(comment_parser, str(","), assignment_expression))
    ),
    (s) => s[0],
    (i, s) => ({
      type: "function-call",
      identifier: i,
      isVoid: false,
      args: [s[1], ...s[2].map((e) => e[2])],
      _isExpr: true,
    }),
    (o, s) => [...o, ...s[2].map((e) => e[0])]
  )
);

function_call_header.setPattern(
  append_comments(
    seq(function_identifier, comment_parser, str("(")),
    (s) => s[0],
    (s) => [s[1]]
  )
);

function_identifier.setPattern(
  alt_sc(
    type_specifier,
    with_comment_before(
      apply(tok(TokenKind.Identifier), (s) => ({
        type: "function-identifier",
        identifier: s.text,
      }))
    )
  )
);

unary_expression.setPattern(
  alt_sc(
    postfix_expression,
    nodeify(
      apply(
        seq(
          alt_sc(str("--"), str("++"), str("+"), str("-"), str("!"), str("~")),
          unary_expression
        ),
        ([expr, left]) => ({
          type: "unary-op",
          op: expr.text as "++" | "--",
          left,
          isAfter: false,
          _isExpr: true,
        })
      )
    )
  )
);

multiplicative_expression.setPattern(
  binop(
    unary_expression,
    multiplicative_expression,
    alt_sc(lstr("*"), lstr("/"), lstr("%"))
  )
);

additive_expression.setPattern(
  binop(
    multiplicative_expression,
    additive_expression,
    alt_sc(lstr("+"), lstr("-"))
  )
);

shift_expression.setPattern(
  binop(additive_expression, shift_expression, alt_sc(lstr(">>"), lstr("<<")))
);

relational_expression.setPattern(
  binop(
    shift_expression,
    relational_expression,
    alt_sc(lstr(">"), lstr("<"), lstr(">="), lstr("<="))
  )
);

equality_expression.setPattern(
  binop(
    relational_expression,
    equality_expression,
    alt_sc(lstr("=="), lstr("!="))
  )
);

and_expression.setPattern(
  binop(equality_expression, and_expression, lstr("&"))
);

exclusive_or_expression.setPattern(
  binop(and_expression, exclusive_or_expression, lstr("^"))
);

inclusive_or_expression.setPattern(
  binop(exclusive_or_expression, inclusive_or_expression, lstr("|"))
);

logical_and_expression.setPattern(
  binop(inclusive_or_expression, logical_and_expression, lstr("&&"))
);

logical_xor_expression.setPattern(
  binop(logical_and_expression, logical_xor_expression, lstr("^^"))
);

logical_or_expression.setPattern(
  binop(logical_xor_expression, logical_or_expression, lstr("||"))
);

conditional_expression.setPattern(
  alt_sc(
    nodeify_commented(
      commentify(
        seq(
          logical_or_expression,
          comment_parser,
          str("?"),
          expression,
          comment_parser,
          str(":"),
          assignment_expression
        ),
        (l) =>
          ({
            type: "conditional",
            condition: l[0],
            ifTrue: l[3],
            ifFalse: l[6],
          } as ConditionalExpr),
        (l) => [l[1], l[4]]
      )
    ),
    logical_or_expression
  )
);

assignment_expression.setPattern(
  alt_sc(
    nodeify_commented(
      commentify(
        seq(
          unary_expression,
          comment_parser,
          assignment_operator,
          assignment_expression
        ),
        (l) => ({
          type: "assignment",
          left: l[0],
          right: l[3],
          op: l[2],
          _isExpr: true,
        }),
        (l) => [l[1]]
      )
    ),
    conditional_expression
  )
);

assignment_operator.setPattern(
  alt_sc(
    lstr("="),
    lstr("*="),
    lstr("/="),
    lstr("%="),
    lstr("+="),
    lstr("-="),
    lstr("<<="),
    lstr(">>="),
    lstr("&="),
    lstr("^="),
    lstr("|=")
  )
);

expression.setPattern(binop(assignment_expression, expression, lstr(",")));

constant_expression.setPattern(conditional_expression);

declaration.setPattern(
  alt_sc(
    commentify(
      seq(init_declarator_list, comment_parser, str(";")),
      (s) =>
        ({
          type: "declarator-list",
          declaratorList: s[0],
          _isDecl: true,
        } satisfies Declaration),
      (s) => [s[1]]
    ),
    commentify(
      seq(
        apply(type_qualifier, (x) => (console.log("asdasd got here"), x)),
        with_comment_before(apply(tok(TokenKind.Identifier), (t) => t.text)),
        comment_parser,
        str("{"),
        struct_declaration_list,
        comment_parser,
        str("}"),
        opt_sc(
          seq(
            with_comment_before(
              apply(tok(TokenKind.Identifier), (t) => t.text)
            ),
            opt_sc(
              seq(
                comment_parser,
                str("["),
                constant_expression,
                comment_parser,
                str("]")
              )
            )
          )
        ),
        comment_parser,
        str(";")
      ),
      (s) =>
        ({
          type: "struct",
          typeQualifier: s[0],
          name: s[1],
          name2: s[7]?.[0],
          declarationList: s[4],
          constantExpr: s[7]?.[1]?.[2],
          _isDecl: true,
        } satisfies Declaration),
      (s) => [s[2], s[5], ...(s[7]?.[1] ? [s[7][1][0], s[7][1][3]] : []), s[8]]
    ),
    commentify(
      seq(function_prototype, comment_parser, str(";")),
      (s) => ({ type: "function-prototype", prototype: s[0], _isDecl: true }),
      (s) => [s[1]]
    ),
    commentify(
      seq(
        str("precision"),
        precision_qualifier,
        type_specifier_no_prec,
        comment_parser,
        str(";")
      ),
      (s) =>
        ({
          type: "type-specifier",
          precision: s[1],
          specifier: s[2],
          _isDecl: true,
        } satisfies Declaration),
      (s) => [s[3]]
    ),
    commentify(
      seq(type_qualifier, comment_parser, str(";")),
      (s) => ({
        type: "type-qualifier",
        typeQualifier: s[0],
        _isDecl: true,
      }),
      (s) => [s[1]]
    )
  )
);

function_prototype.setPattern(
  add_comments_and_transform(
    seq(function_declarator, comment_parser, str(")")),
    (s) => s[0],
    (v) => v,
    (oc, s) => [...oc, s[1]]
  )
);

function_declarator.setPattern(
  alt_sc(function_header_with_parameters, function_header)
);

function_header_with_parameters.setPattern(
  add_comments_and_transform(
    seq(
      function_header,
      commentify(
        seq(
          parameter_declaration,
          rep_sc(seq(comment_parser, str(","), parameter_declaration))
        ),
        (s) =>
          [s[0], ...s[1].map((v) => v[2])] as Commented<ParameterDeclaration>[],
        (s) => s[1].map((v) => v[0])
      )
    ),
    (s) => s[0],
    (fh, s) => ({
      ...fh,
      parameters: s[1],
    }),
    (oc) => oc
  )
);

function_header.setPattern(
  commentify(
    seq(
      fully_specified_type,
      with_comment_before(apply(tok(TokenKind.Identifier), (t) => t.text)),
      comment_parser,
      str("(")
    ),
    (s) =>
      ({
        fullySpecifiedType: s[0],
        name: s[1],
      } as FunctionHeader),
    (s) => [s[2]]
  )
);

parameter_declarator.setPattern(
  commentify(
    seq(
      type_specifier,
      with_comment_before(apply(tok(TokenKind.Identifier), (t) => t.text)),
      opt_sc(seq(str("["), constant_expression, comment_parser, str("]")))
    ),
    (s) => ({
      typeSpecifier: s[0],
      identifier: s[1],
      arraySize: s[2]?.[1],
    }),
    (s) => [s[2]?.[2] ?? []]
  )
);

parameter_declaration.setPattern(
  with_comment_before(
    apply(
      seq(
        opt_sc(parameter_type_qualifier),
        parameter_qualifier,
        alt_sc(
          apply(parameter_declarator, (pd) => ({
            type: "declarator",
            declarator: pd,
          })),
          apply(parameter_type_specifier, (pts) => ({
            type: "specifier",
            specifier: pts,
          }))
        )
      ),
      ([ptq, pq, dos]) =>
        ({
          parameterTypeQualifier: ptq,
          parameterQualifier: pq,
          declaratorOrSpecifier: dos,
        } as ParameterDeclaration)
    )
  )
);

parameter_qualifier.setPattern(
  alt_sc(nodeify(alt_sc(lstr("in"), lstr("out"), lstr("inout"))), nil())
);

parameter_type_specifier.setPattern(type_specifier);

// custom rule for convenience
const identifier_declaration: Parser<
  TokenKind,
  Commented<SingleDeclaration>
> = commentify(
  seq(
    with_comment_before(apply(tok(TokenKind.Identifier), (t) => t.text)),
    alt_sc(
      commentify(
        seq(str("["), constant_expression, comment_parser, str("]")),
        (s) =>
          ({
            type: "sized-array",
            size: s[1],
          } satisfies SingleDeclarationVariant),
        (s) => [s[2]]
      ),
      commentify(
        seq(
          str("["),
          opt_sc(constant_expression),
          comment_parser,
          str("]"),
          comment_parser,
          str("="),
          initializer
        ),
        (s) =>
          ({
            type: "initialized-array",
            size: s[1],
            initializer: s[6],
          } satisfies SingleDeclarationVariant),
        (s) => [s[2], s[4]]
      ),
      commentify(
        seq(comment_parser, str("="), initializer),
        (s) =>
          ({
            type: "initialized",
            initializer: s[2],
          } satisfies SingleDeclarationVariant),
        (s) => [s[0]]
      ),
      nil()
    )
  ),
  (s) => ({
    name: s[0],
    variant: s[1],
  }),
  (s) => []
);

init_declarator_list.setPattern(
  with_comment_before(
    apply(
      seq(
        alt_sc(
          with_comment_before(
            apply(
              fully_specified_type,
              (s) =>
                ({
                  type: "type",
                  declType: s,
                } satisfies SingleDeclarationStart)
            )
          ),
          with_comment_before(
            apply(
              str("invariant"),
              (s) => ({ type: "invariant" } satisfies SingleDeclarationStart)
            )
          )
        ),
        commentify(
          opt_sc(
            seq(
              identifier_declaration,
              rep_sc(seq(comment_parser, str(","), identifier_declaration))
            )
          ),
          (s) => (s ? [s[0], ...s[1].map((e) => e[2])] : []),
          (s) => (s ? s[1].map((e) => e[0]) : [])
        )
      ),
      (s) => ({
        init: s[0],
        declarations: s[1],
      })
    )
  )
);

// not even implementing this one tbh
// no need lol
single_declaration;

fully_specified_type.setPattern(
  with_comment_before(
    apply(
      seq(opt_sc(type_qualifier), type_specifier),
      ([qualifier, specifier]) => ({
        specifier,
        qualifier,
      })
    )
  )
);

invariant_qualifier.setPattern(with_comment_before(lstr("invariant")));

interpolation_qualifier.setPattern(
  with_comment_before(alt_sc(lstr("smooth"), lstr("flat")))
);

layout_qualifier.setPattern(
  add_comments_and_transform(
    seq(
      str("layout"),
      comment_parser,
      str("("),
      layout_qualifier_id_list,
      comment_parser,
      str(")")
    ),
    (s) => s[3],
    (d, s) => d,
    (o, s) => [s[1], ...o, s[4]]
  )
);

layout_qualifier_id_list.setPattern(
  commentify(
    seq(
      layout_qualifier_id,
      rep_sc(seq(comment_parser, lstr(","), layout_qualifier_id))
    ),
    (s) => [s[0], ...s[1].map((e) => e[2])],
    (s) => s[1].map((e) => e[0])
  )
);

layout_qualifier_id.setPattern(
  alt_sc(
    commentify(
      seq(
        tok(TokenKind.Identifier),
        comment_parser,
        str("="),
        comment_parser,
        alt_sc(
          tok(TokenKind.IntegerDecimal),
          tok(TokenKind.IntegerHex),
          tok(TokenKind.IntegerOctal)
        )
      ),
      (s) => ({
        identifier: s[0].text,
        value: glslParseInt(s[4].text),
      }),
      (s) => [s[1], s[3]]
    ),
    with_comment_before(
      apply(alt_sc(tok(TokenKind.Identifier), tok(TokenKind.Keyword)), (i) => ({
        identifier: i.text,
      }))
    )
  )
);

parameter_type_qualifier.setPattern(with_comment_before(lstr("const")));

type_qualifier.setPattern(
  alt_sc(
    // storage_qualifier
    with_comment_before(
      apply(storage_qualifier, (q) => ({
        type: "sq",
        storageQualifier: q,
      }))
    ),
    // layout_qualifier
    // layout_qualifier storage_qualifier
    with_comment_before(
      apply(seq(layout_qualifier, opt_sc(storage_qualifier)), ([lq, sq]) => ({
        type: "lq-sq",
        layoutQualifier: lq,
        storageQualifier: sq,
      }))
    ),
    // interpolation_qualifier storage_qualifier
    // interpolation_qualifier
    with_comment_before(
      apply(
        seq(interpolation_qualifier, opt_sc(storage_qualifier)),
        ([iq, sq]) => ({
          type: "intq-sq",
          interpolationQualifier: iq,
          storageQualifier: sq,
        })
      )
    ),
    // invariant_qualifier storage_qualifier
    // invariant_qualifier interpolation_qualifier storage_qualifier
    with_comment_before(
      apply(
        seq(
          invariant_qualifier,
          opt_sc(interpolation_qualifier),
          storage_qualifier
        ),
        ([invq, intq, sq]) => ({
          type: "invq-intq-sq",
          interpolationQualifier: intq,
          invariantQualifier: invq,
          storageQualifier: sq,
        })
      )
    )
  )
);

storage_qualifier.setPattern(
  with_comment_before(
    alt_sc(
      lstr("const"),
      lstr("in"),
      lstr("out"),
      apply(seq(str("centroid"), str("in")), () => "centroid in"),
      apply(seq(str("centroid"), str("out")), () => "centroid out"),
      lstr("uniform")
    )
  )
);

type_specifier.setPattern(
  commentify(
    seq(opt_sc(precision_qualifier), type_specifier_no_prec),
    ([precision, specifier]) =>
      ({
        type: "type-specifier",
        specifier,
        precision,
      } as TypeSpecifier),
    (s) => []
  )
);

type_specifier_no_prec.setPattern(
  commentify(
    seq(
      type_specifier_nonarray,
      opt_sc(
        seq(
          comment_parser,
          seq(str("["), opt_sc(constant_expression), comment_parser, str("]"))
        )
      )
    ),
    (s) =>
      ({
        typeName: s[0],
        arrayType: s[1]
          ? s[1][1][1]
            ? { type: "static", size: s[1][1][1] }
            : { type: "dynamic" }
          : { type: "none" },
      } as TypeNoPrec),
    (s) => (s[1] ? [s[1][0], s[1][1][2]] : [])
  )
);

type_specifier_nonarray.setPattern(
  with_comment_before(
    alt_sc(
      apply(
        with_comment_before(
          alt_sc(
            alt_sc(
              lstr("void"),
              lstr("float"),
              lstr("int"),
              lstr("uint"),
              lstr("bool"),
              lstr("vec2"),
              lstr("vec3"),
              lstr("vec4"),
              lstr("bvec2"),
              lstr("bvec3"),
              lstr("bvec4"),
              lstr("ivec2"),
              lstr("ivec3"),
              lstr("ivec4"),
              lstr("uvec2"),
              lstr("uvec3")
            ),
            alt_sc(
              lstr("uvec4"),
              lstr("mat2"),
              lstr("mat3"),
              lstr("mat4"),
              lstr("mat3x2"),
              lstr("mat3x3"),
              lstr("mat3x4"),
              lstr("mat4x2"),
              lstr("mat4x3"),
              lstr("mat4x4")
            ),
            alt_sc(
              lstr("sampler2D"),
              lstr("sampler3D"),
              lstr("samplerCube"),
              lstr("sampler2DShadow"),
              lstr("samplerCubeShadow"),
              lstr("sampler2DArray"),
              lstr("sampler2DArrayShadow"),
              lstr("isampler2D"),
              lstr("isampler3D"),
              lstr("isamplerCube"),
              lstr("isampler2DArray"),
              lstr("usampler2D"),
              lstr("usampler3D"),
              lstr("usamplerCube"),
              lstr("usampler2DArray")
            )
          )
        ),
        (s) => ({
          type: "builtin",
          name: s,
        })
      ),
      apply(struct_specifier, (s) => ({
        type: "struct",
        struct: s,
      })),
      apply(
        with_comment_before(apply(tok(TokenKind.Identifier), (s) => s.text)),
        (s) =>
          ({
            type: "custom",
            name: s,
          } satisfies TypeSpecifierNonarray)
      )
    )
  )
);

precision_qualifier.setPattern(
  with_comment_before(alt_sc(lstr("highp"), lstr("mediump"), lstr("lowp")))
);

struct_specifier.setPattern(
  commentify(
    seq(
      str("struct"),
      opt_sc(
        with_comment_before(apply(tok(TokenKind.Identifier), (t) => t.text))
      ),
      comment_parser,
      str("{"),
      struct_declaration_list,
      comment_parser,
      str("}")
    ),
    (s) => ({
      members: s[4],
      name: s[1],
      _isStruct: true,
    }),
    (s) => [s[2], s[5]]
  )
);

struct_declaration_list.setPattern(
  with_comment_before(rep_sc(struct_declaration))
);

struct_declaration.setPattern(
  commentify(
    seq(
      opt_sc(type_qualifier),
      type_specifier,
      struct_declarator_list,
      comment_parser,
      str(";")
    ),
    (s) => ({
      typeQualifier: s[0],
      typeSpecifier: s[1],
      declaratorList: s[2],
    }),
    (s) => [s[3]]
  )
);

struct_declarator_list.setPattern(
  commentify(
    seq(
      struct_declarator,
      rep_sc(seq(comment_parser, str(","), struct_declarator))
    ),
    (s) => [s[0], ...s[1].map((e) => e[2])],
    (s) => s[1].map((e) => e[0])
  )
);

struct_declarator.setPattern(
  commentify(
    seq(
      tok(TokenKind.Identifier),
      opt_sc(
        seq(
          comment_parser,
          str("["),
          opt_sc(constant_expression),
          comment_parser,
          str("]")
        )
      )
    ),
    (s) =>
      ({
        name: s[0].text,
        isArray: s[1]
          ? {
              expr: s[1]?.[2],
            }
          : undefined,
      } as StructDeclarator),
    (s) => (s[1] ? [s[1][0], s[1][3]] : [])
  )
);

initializer.setPattern(assignment_expression);

declaration_statement.setPattern(
  nodeify(
    apply(
      declaration,
      (decl) =>
        ({
          type: "declaration",
          decl,
          _isStmt: true,
        } satisfies Stmt)
    )
  )
);

statement.setPattern(alt_sc(compound_statement_with_scope, simple_statement));

statement_no_new_scope.setPattern(
  alt_sc(compound_statement_no_new_scope, simple_statement)
);

statement_with_scope.setPattern(
  alt_sc(compound_statement_no_new_scope, simple_statement)
);

simple_statement.setPattern(
  alt_sc(
    expression_statement,
    declaration_statement,
    selection_statement,
    switch_statement,
    case_label,
    iteration_statement,
    jump_statement
  )
);

compound_statement_with_scope.setPattern(compound_statement_no_new_scope);

compound_statement_no_new_scope.setPattern(
  nodeify_commented(
    commentify(
      seq(str("{"), opt_sc(statement_list), comment_parser, str("}")),
      (s) => ({ type: "compound", statements: s[1] ?? [], _isStmt: true }),
      (s) => [s[2]]
    )
  )
);

statement_list.setPattern(
  apply(seq(statement, rep_sc(statement)), ([stmt1, rest]) => [stmt1, ...rest])
);

expression_statement.setPattern(
  nodeify_commented(
    commentify(
      seq(opt_sc(expression), comment_parser, str(";")),
      (s) => ({
        type: "expr",
        expr: s[0],
        _isStmt: true,
      }),
      (s) => [s[1]]
    )
  )
);

selection_statement.setPattern(
  nodeify_commented(
    commentify(
      seq(
        str("if"),
        comment_parser,
        str("("),
        expression,
        comment_parser,
        str(")"),
        selection_rest_statement
      ),
      (s) => ({
        type: "selection",
        cond: s[3],
        rest: s[6],
        _isStmt: true,
      }),
      (s) => [s[1], s[4]]
    )
  )
);

selection_rest_statement.setPattern(
  commentify(
    seq(
      statement_with_scope,
      opt_sc(seq(comment_parser, str("else"), statement_with_scope))
    ),
    (s) => ({
      if: s[0],
      else: s[1]?.[2],
      _isStmt: true,
    }),
    (s) => (s[1] ? [s[1][0]] : [])
  )
);

condition.setPattern(
  alt_sc(
    with_comment_before(apply(expression, (s) => ({ type: "expr", expr: s }))),
    commentify(
      seq(
        fully_specified_type,
        with_comment_before(apply(tok(TokenKind.Identifier), (t) => t.text)),
        comment_parser,
        str("="),
        initializer
      ),
      (s) =>
        ({
          type: "type-equal-init",
          fullySpecifiedType: s[0],
          name: s[1],
          initializer: s[4],
        } as Condition),
      (s) => [s[2]]
    )
  )
);

switch_statement.setPattern(
  nodeify_commented(
    commentify(
      seq(
        str("switch"),
        comment_parser,
        str("("),
        expression,
        comment_parser,
        str(")"),
        comment_parser,
        str("{"),
        switch_statement_list,
        comment_parser,
        str("}")
      ),
      (s) =>
        ({
          type: "switch",
          expr: s[3],
          stmts: s[8] ?? [],
          _isStmt: true,
        } satisfies SwitchStmt),
      (s) => [s[1], s[4], s[6], s[9]]
    )
  )
);

switch_statement_list.setPattern(opt_sc(statement_list));

case_label.setPattern(
  nodeify_commented(
    alt_sc(
      commentify(
        seq(str("case"), expression, comment_parser, str(":")),
        (s) => ({ type: "case", expr: s[1], _isStmt: true } as Stmt),
        (s) => [s[2]]
      ),
      commentify(
        seq(str("default"), comment_parser, str(":")),
        (s) => ({ type: "default-case", _isStmt: true }),
        (s) => [s[1]]
      )
    )
  )
);

iteration_statement.setPattern(
  nodeify_commented(
    alt_sc(
      commentify(
        seq(
          str("while"),
          comment_parser,
          str("("),
          condition,
          comment_parser,
          str(")"),
          statement_no_new_scope
        ),
        (s) =>
          ({
            type: "while",
            cond: s[3],
            body: s[6],
            _isStmt: true,
          } as IterationStmt),
        (s) => [s[1], s[4]]
      ),
      commentify(
        seq(
          str("do"),
          statement_with_scope,
          comment_parser,
          str("while"),
          comment_parser,
          str("("),
          expression,
          comment_parser,
          str(")"),
          comment_parser,
          str(";")
        ),
        (s) =>
          ({
            type: "do-while",
            cond: s[6],
            body: s[1],
            _isStmt: true,
          } as IterationStmt),
        (s) => [s[2], s[4], s[7], s[9]]
      ),
      commentify(
        seq(
          str("for"),
          comment_parser,
          str("("),
          for_init_statement,
          for_rest_statement,
          comment_parser,
          str(")"),
          statement_no_new_scope
        ),
        (s) => ({
          type: "for",
          init: s[3],
          rest: s[4],
          body: s[7],
          _isStmt: true,
        }),
        (s) => [s[1], s[5]]
      )
    )
  )
);

for_init_statement.setPattern(
  alt_sc(expression_statement, declaration_statement)
);

conditionopt.setPattern(alt_sc(condition, nil()));

for_rest_statement.setPattern(
  commentify(
    seq(conditionopt, comment_parser, str(";"), opt_sc(expression)),
    (s) => ({
      condition: s[0],
      expr: s[3],
    }),
    (s) => [s[1]]
  )
);

jump_statement.setPattern(
  nodeify_commented(
    alt_sc(
      commentify(
        seq(
          alt_sc(lstr("continue"), lstr("break"), lstr("discard")),
          comment_parser,
          str(";")
        ),
        (s) => ({ type: s[0], _isStmt: true } as Stmt),
        (s) => [s[1]]
      ),
      commentify(
        seq(str("return"), opt_sc(expression), comment_parser, str(";")),
        (s) => ({ type: "return", expr: s[1], _isStmt: true } satisfies Stmt),
        (s) => [s[2]]
      )
    )
  )
);

translation_unit.setPattern(
  commentify_no_comments_before(
    seq(rep_sc(external_declaration), comment_parser),
    (s) => s[0],
    (s) => [s[1]]
  )
);

external_declaration.setPattern(
  alt_sc(
    function_definition,
    nodeify(
      apply(declaration, (s) => ({
        type: "declaration",
        decl: s,
        _isExtDecl: true,
      }))
    )
  )
);

function_definition.setPattern(
  nodeify_commented(
    commentify(
      seq(function_prototype, compound_statement_no_new_scope),
      (s) => ({
        type: "function",
        prototype: s[0],
        body: s[1],
        _isExtDecl: true,
      }),
      (s) => []
    )
  )
);
