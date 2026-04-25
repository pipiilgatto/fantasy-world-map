declare module "alea" {
  type AleaRandom = (() => number) & {
    uint32(): number;
    fract53(): number;
    version: string;
    args: unknown[];
  };

  export default function Alea(...seeds: unknown[]): AleaRandom;
}
