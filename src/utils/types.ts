export type MaybePromise<T> = Promise<T> | T;

export type WithKey<K extends string | number | symbol, ResType> = {
  [key in K]: ResType;
};

export type ExtractKeyAsObject = <T, K extends keyof T, D>(
  source: T,
  key: K,
  defaultValue?: D,
) => {
  [key in K]: T[K] | D;
};
