const allowedSwizzles = {
  2: /[xy]{1,2}|[rg]{1,2}|[st]{1,2}/,
  3: /[xyz]{1,3}|[rgb]{1,3}|[stp]{1,3}/,
  4: /[xyzw]{1,4}|[rgba]{1,4}|[stpq]{1,4}/,
};

export function swizzleCharToIndex(char: string) {
  return {
    x: 0,
    y: 1,
    z: 2,
    w: 3,
    r: 0,
    g: 1,
    b: 2,
    a: 3,
    s: 0,
    t: 1,
    p: 2,
    q: 3,
  }[char];
}

export function getSwizzleRegex(arity: 2 | 3 | 4) {
  return allowedSwizzles[arity];
}

export function permute<T>(arr: T[]): T[][] {
  if (arr.length === 0) return [];
  if (arr.length === 1) return [[arr[0]]];

  const first = arr[0];

  const prevPermutations = permute(arr.slice(1));

  let permutations: T[][] = [];
  for (const p of prevPermutations) {
    for (let i = 0; i < arr.length; i++) {
      const p2 = p.concat();
      p2.splice(i, 0, first);
      permutations.push(p2);
    }
  }

  return permutations;
}

export function powerSet<T>(arr: T[]): T[][] {
  if (arr.length === 0) return [[]];

  const first = arr[0];

  const nextPowerSet = powerSet(arr.slice(1));

  return [...nextPowerSet, ...nextPowerSet.map((e) => [first, ...e])];
}

export function getNonemptyStringPermutations(str: string) {
  const ps = powerSet(str.split("")).slice(1);
  return ps.map((p) => permute(p).map((p) => p.join(""))).flat(1);
}

export const lValueSwizzles = {
  2: new Set(
    ["xy", "rg", "st"].map((s) => getNonemptyStringPermutations(s)).flat(1)
  ),
  3: new Set(
    ["xyz", "rgb", "stp"].map((s) => getNonemptyStringPermutations(s)).flat(1)
  ),
  4: new Set(
    ["xyzw", "rgba", "stpq"]
      .map((s) => getNonemptyStringPermutations(s))
      .flat(1)
  ),
};
