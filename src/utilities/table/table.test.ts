import { test, expect } from "bun:test";
import { table } from "./table";

function exampleTable1() {
  const tbl = table<{
    a: number;
    b: string;
  }>();

  tbl.add({
    a: 0,
    b: "hello",
  });
  tbl.add({
    a: 1,
    b: "hello",
  });
  tbl.add({
    a: 0,
    b: "world",
  });
  tbl.add({
    a: 1,
    b: "world",
  });

  return tbl;
}

for (const a of [0, 1]) {
  test(`a=${a}`, () => {
    const tbl = exampleTable1();

    expect(tbl.filter.a(a).get()).toEqual([
      {
        a,
        b: "hello",
      },
      {
        a,
        b: "world",
      },
    ]);
  });
}

for (const b of ["hello", "world"]) {
  test(`b=${b}`, () => {
    const tbl = exampleTable1();

    expect(tbl.filter.b(b).get()).toEqual([
      {
        a: 0,
        b,
      },
      {
        a: 1,
        b,
      },
    ]);
  });
}

for (const [a, b] of [
  [0, "hello"],
  [0, "world"],
  [1, "hello"],
  [1, "world"],
] as const) {
  test("a=0,b=hello", () => {
    const tbl = exampleTable1();

    expect(tbl.filter.a(a).filter.b(b).get()).toEqual([
      {
        a,
        b,
      },
    ]);
  });
}
