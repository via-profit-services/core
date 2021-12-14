const dotNotationSet = <S extends Record<string | number | symbol, any>, P extends string, V>(
  obj: S,
  path: P,
  value: V,
) => {
  // Regex explained: https://regexr.com/58j0k
  const pathArray: string[] = Array.isArray(path) ? path : path.match(/([^[.\]])+/g);
  pathArray.reduce((acc, key, i) => {
    if (acc[key] === undefined) {
      (acc as any)[key] = {};
    }

    if (i === pathArray.length - 1) {
      (acc as any)[key] = value;
    }

    return acc[key];
  }, obj);
};

export default dotNotationSet;
