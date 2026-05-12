/**
 * Validates that a dot-notation path exists inside an object.
 */
export const validateMapPath = (obj: any, path: string): boolean => {
  const parts = path.split('.');
  let current = obj;

  for (const part of parts) {
    if (current == null || typeof current !== 'object' || !(part in current)) {
      return false;
    }
    current = current[part];
  }

  return true;
};


export default validateMapPath;
