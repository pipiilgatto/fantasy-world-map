export type Point = [number, number];

export const rn = (value: number, digits = 0): number => {
  const multiplier = 10 ** digits;
  return Math.round(value * multiplier) / multiplier;
};

export const minmax = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

export const lim = (value: number): number => minmax(value, 0, 100);

export const rand = (min?: number, max?: number): number => {
  if (min === undefined && max === undefined) return Math.random();
  if (max === undefined) {
    max = min;
    min = 0;
  }
  return Math.floor(Math.random() * (max! - min! + 1)) + min!;
};

export const P = (probability: number): boolean => {
  if (probability >= 1) return true;
  if (probability <= 0) return false;
  return Math.random() < probability;
};

export const getNumberInRange = (rangeValue: string): number => {
  if (typeof rangeValue !== "string") return 0;
  if (!Number.isNaN(+rangeValue)) return ~~rangeValue + +P(+rangeValue - ~~rangeValue);

  const sign = rangeValue[0] === "-" ? -1 : 1;
  if (Number.isNaN(+rangeValue[0])) rangeValue = rangeValue.slice(1);

  const range = rangeValue.includes("-") ? rangeValue.split("-") : null;
  if (!range) return 0;

  const count = rand(parseFloat(range[0]) * sign, +parseFloat(range[1]));
  if (Number.isNaN(count) || count < 0) return 0;
  return count;
};

export const createTypedArray = ({
  maxValue,
  length,
  from
}: {
  maxValue: number;
  length: number;
  from?: ArrayLike<number>;
}): Uint8Array | Uint16Array | Uint32Array => {
  const TypedArray = maxValue <= 255 ? Uint8Array : maxValue <= 65535 ? Uint16Array : Uint32Array;
  return from ? TypedArray.from(from) : new TypedArray(length);
};

export const mean = (values: number[]): number => {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

export const leastIndex = <T>(values: T[], comparator: (a: T, b: T) => number): number | undefined => {
  if (!values.length) return undefined;
  let minIndex = 0;
  for (let index = 1; index < values.length; index++) {
    if (comparator(values[index], values[minIndex]) < 0) minIndex = index;
  }
  return minIndex;
};

export const d3Range = (stop: number): number[] => {
  const length = Math.max(0, Math.ceil(stop));
  return Array.from({length}, (_, index) => index);
};

export const distance = (a: Point, b: Point): number => {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
};

export const clampPoint = ([x, y]: Point, width: number, height: number): Point => {
  return [minmax(x, 0, width), minmax(y, 0, height)];
};
