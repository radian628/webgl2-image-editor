// how to ensure that comments will always be counted?:
// make sure that all sequences of tokens (i.e. ones that can contain comments)
// always ALWAYS allow for interleaving of comments
// for instance this means no seq allowed and no rep allowed.
// both of these must instead either manually interleave comments
// or I must make versions that automatically do it.

import {
  alt_sc,
  apply,
  lrec,
  lrec_sc,
  Parser,
  rep,
  rep_sc,
  seq,
  tok,
} from "typescript-parsec";
import { TokenKind } from "./lexer";
import { ASTNode, BinaryOpExpr, Comment, Commented } from "./parser";

export function seq_interleave<I, TKind, T1, T2>(
  i: Parser<TKind, I>,
  p1: Parser<TKind, T1>,
  p2: Parser<TKind, T2>
): Parser<TKind, [T1, I, T2]>;

export function seq_interleave<I, TKind, T1, T2, T3>(
  i: Parser<TKind, I>,
  p1: Parser<TKind, T1>,
  p2: Parser<TKind, T2>,
  p3: Parser<TKind, T3>
): Parser<TKind, [T1, I, T2, I, T3]>;

export function seq_interleave<I, TKind, T1, T2, T3, T4>(
  i: Parser<TKind, I>,
  p1: Parser<TKind, T1>,
  p2: Parser<TKind, T2>,
  p3: Parser<TKind, T3>,
  p4: Parser<TKind, T4>
): Parser<TKind, [T1, I, T2, I, T3, I, T4]>;

export function seq_interleave(
  i: Parser<void, {}>,
  ...ps: Parser<void, {}>[]
): Parser<void, {}> {
  return seq(
    ps[0],
    // @ts-expect-error yeah im not trusting typescript to be able to infer this lol
    ...ps
      .slice(1)
      .map((p) => [i, p])
      .flat(1)
  );
}

export const rep_interleave_sc = lrec_sc;

export const comment_parser = apply(rep_sc(tok(TokenKind.Comment)), (c) =>
  c.map((c) => ({ comment: c.text } as Comment))
);

export function comment_before<T1>(p: Parser<TokenKind, T1>) {
  return seq(comment_parser, p);
}

export function with_comment_before<T>(p: Parser<TokenKind, T>) {
  return commentify<T, T>(
    p,
    (s) => s,
    (c) => []
  );
}

export function nodeify<T>(
  p: Parser<TokenKind, T>
): Parser<TokenKind, ASTNode<T>> {
  return apply(comment_before(p), ([comments, data], [start, end]) => ({
    data,
    comments: [comments],
    range: { start: start?.pos.index!, end: end?.pos.index! },
    _isNode: true,
  }));
}

export function nodeify_commented<T>(
  p: Parser<TokenKind, Commented<T>>
): Parser<TokenKind, ASTNode<T>> {
  return apply(p, (data, [start, end]) => ({
    data: data.data,
    comments: [...data.comments],
    range: { start: start?.pos.index!, end: end?.pos.index! },
    _isNode: true,
  }));
}

export function commentify<T, U>(
  p: Parser<TokenKind, T>,
  convertToData: (t: T) => U,
  convertToComments: (t: T) => Comment[][]
): Parser<TokenKind, Commented<U>> {
  return apply(comment_before(p), ([comments, data]) => ({
    data: convertToData(data),
    comments: [comments, ...convertToComments(data)],
  }));
}

export function commentify_no_comments_before<T, U>(
  p: Parser<TokenKind, T>,
  convertToData: (t: T) => U,
  convertToComments: (t: T) => Comment[][]
): Parser<TokenKind, Commented<U>> {
  return apply(p, (data) => ({
    data: convertToData(data),
    comments: [...convertToComments(data)],
  }));
}

export function append_comments<T, U>(
  p: Parser<TokenKind, T>,
  convertToData: (t: T) => Commented<U>,
  convertToComments: (t: T) => Comment[][]
): Parser<TokenKind, Commented<U>> {
  return apply(comment_before(p), ([comments, data]) => {
    const underlyingNode = convertToData(data);
    return {
      data: underlyingNode.data,
      comments: [
        comments,
        ...underlyingNode.comments,
        ...convertToComments(data),
      ],
    };
  });
}

export function add_comments_and_transform<T, U, V>(
  p: Parser<TokenKind, T>,
  convertToOldCommented: (t: T) => Commented<U>,
  convertToData: (u: U, t: T) => V,
  mergeComments: (oldComments: Comment[][], t: T) => Comment[][]
): Parser<TokenKind, Commented<V>> {
  return apply(comment_before(p), ([comments, data]) => {
    const oldCommented = convertToOldCommented(data);
    return {
      data: convertToData(oldCommented.data, data),
      comments: [comments, ...mergeComments(oldCommented.comments, data)],
    };
  });
}

// okay in hindsight this really shouldn't be necessary
// i shouldn't have to stretch any nodes
export function stretch_node<T, U>(
  p: Parser<TokenKind, T>,
  node: (t: T) => ASTNode<U>,
  commentsBefore: (t: T) => Comment[][],
  commentsAfter: (t: T) => Comment[][]
): Parser<TokenKind, ASTNode<U>> {
  return apply(comment_before(p), ([comments, data], [start, end]) => ({
    ...node(data),
    comments: [
      comments,
      ...commentsBefore(data),
      ...node(data).comments,
      ...commentsAfter(data),
    ],
    range: { start: start?.pos.index!, end: end?.pos.index! },
  }));
}

export function custom_node<T, U>(
  p: Parser<TokenKind, T>,
  node: (t: T) => U,
  comments: (t: T) => Comment[][]
): Parser<TokenKind, ASTNode<U>> {
  return apply(p, (data, [start, end]) => ({
    data: node(data),
    comments: comments(data),
    range: { start: start?.pos.index!, end: end?.pos.index! },
    _isNode: true,
  }));
}

export function add_comments<T, U>(
  p: Parser<TokenKind, T>,
  node: (t: T) => ASTNode<U>,
  comments: (t: T, oldComments: Comment[][]) => Comment[][]
): Parser<TokenKind, ASTNode<U>> {
  return apply(p, (data, [start, end]) => {
    const astnode = node(data);
    const newcomments = comments(data, astnode.comments);
    return {
      ...astnode,
      comments: newcomments,
    };
  });
}

export function binop_generic<T, U>(
  left: Parser<TokenKind, ASTNode<T>>,
  right: Parser<TokenKind, U>,
  combine: (
    l: ASTNode<T>,
    r: U,
    start: number,
    end: number
  ) => [T, Comment[][]],
  no_sc?: boolean
): Parser<TokenKind, ASTNode<T>> {
  const combine_and_nodeify = (
    l: ASTNode<T>,
    r: U,
    start: number,
    end: number
  ): ASTNode<T> => {
    const [data, comments] = combine(l, r, start, end);
    return {
      data,
      comments,
      range: { start, end },
      _isNode: true,
    };
  };

  return (
    // combined lrec case
    (no_sc ? lrec : lrec_sc)(
      apply(seq(left, right), ([l, r], [s, e]) =>
        combine_and_nodeify(l, r, s?.pos.index!, e?.pos.index!)
      ),
      apply(right, (data, [start, end]) => ({ data, start, end })),
      (l: ASTNode<T>, r) =>
        combine_and_nodeify(l, r.data, l.range.start, r.end?.pos.index!)
    )
  );
}

export function binop<NodeType extends ASTNode<T>, T>(
  higher_prec: Parser<TokenKind, NodeType>,
  self_prec: Parser<TokenKind, ASTNode<T>>,
  ops: Parser<TokenKind, BinaryOpExpr["op"]>
): Parser<TokenKind, ASTNode<BinaryOpExpr> | NodeType> {
  return lrec_sc(
    higher_prec,
    seq(comment_parser, ops, higher_prec),
    (left, right) => {
      const binopNode = {
        type: "binary-op",
        op: right[1],
        left,
        right: right[2],
      } as BinaryOpExpr;
      return {
        data: binopNode,
        comments: [right[0]],
        range: { start: left.range.start, end: right[2].range.end },
        _isNode: true,
      };
    }
  );
}
