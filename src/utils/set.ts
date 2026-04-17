/**
 * Safely sets a value inside an object using dot-notation paths.
 *
 * Example:
 *   dotNotationSet(obj, "variables.files.0", uploadInstance)
 *
 * Improvements:
 *   - Correct handling of arrays
 *   - Prevents overwriting arrays with objects and vice versa
 *   - Creates intermediate structures safely
 *   - Throws clear errors on invalid paths
 */
export default function dotNotationSet(
  obj: Record<string, any>,
  path: string,
  value: unknown,
): void {
  if (!obj || typeof obj !== 'object') {
    throw new Error(`dotNotationSet: target must be an object`);
  }

  const parts = path.split('.');
  const last = parts.pop() as string;

  let current: any = obj;

  for (const part of parts) {
    const index = Number(part);

    // ARRAY INDEX
    if (!Number.isNaN(index)) {
      if (!Array.isArray(current)) {
        throw new Error(
          `dotNotationSet: expected array at «${part}» in path «${path}», but found ${typeof current}`,
        );
      }

      if (current[index] == null) {
        // Create empty object for next step
        current[index] = {};
      }

      current = current[index];
      continue;
    }

    // OBJECT KEY
    if (typeof current !== 'object' || current === null) {
      throw new Error(
        `dotNotationSet: expected object at «${part}» in path «${path}», but found ${typeof current}`,
      );
    }

    if (!(part in current)) {
      current[part] = {};
    }

    current = current[part];
  }

  //
  // SET FINAL VALUE
  //
  const index = Number(last);

  if (!Number.isNaN(index)) {
    if (!Array.isArray(current)) {
      throw new Error(
        `dotNotationSet: expected array at final segment «${last}» in path «${path}»`,
      );
    }
    current[index] = value;
    return;
  }

  if (typeof current !== 'object' || current === null) {
    throw new Error(
      `dotNotationSet: expected object at final segment «${last}» in path «${path}»`,
    );
  }

  current[last] = value;
}
