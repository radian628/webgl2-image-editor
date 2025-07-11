export const unaryPrecedences = {
  defined: 20,
  "++": 20,
  "--": 20,
  "+": 20,
  "-": 20,
  "~": 20,
  "!": 20,
};

export const binaryPrecedences = {
  defined: 20,
  "[]": 20,
  "*": 30,
  "/": 30,
  "%": 30,
  "+": 40,
  "-": 40,
  "<<": 50,
  ">>": 50,
  "<": 60,
  ">": 60,
  "<=": 60,
  ">=": 60,
  "==": 70,
  "!=": 70,
  "&": 80,
  "^": 90,
  "|": 100,
  "&&": 110,
  "^^": 120,
  "||": 130,
  ",": 140,
};

export const minPrecedence = 10;

export const maxPrecedence = 150;
