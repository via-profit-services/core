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
    const isArrayIndex = /^\d+$/.test(part); // Проверяем, является ли часть числом (индексом массива)

    if (isArrayIndex) {
      const index = parseInt(part, 10);

      // Проверяем, что текущий элемент - массив
      if (!Array.isArray(current)) {
        throw new Error(
          `dotNotationSet: expected array at «${part}» in path «${path}», but got ${typeof current}`,
        );
      }

      // Если индекс не существует, создаем его
      if (!(index in current)) {
        current[index] = {};
      }

      current = current[index];
      continue;
    }

    // Обычный объектный ключ
    if (typeof current !== 'object' || current === null) {
      throw new Error(
        `dotNotationSet: expected object at «${part}» in path «${path}», but got ${typeof current}`,
      );
    }

    // Если ключа нет, создаем
    if (!(part in current)) {
      // Смотрим на следующий сегмент, чтобы понять, что создавать - массив или объект
      const nextPart = parts[parts.indexOf(part) + 1];
      const isNextArrayIndex = nextPart && /^\d+$/.test(nextPart);

      if (isNextArrayIndex) {
        // Следующий сегмент - индекс массива, создаем массив
        current[part] = [];
      } else {
        // Иначе создаем объект
        current[part] = {};
      }
    }

    current = current[part];
  }

  // Устанавливаем финальное значение
  const isLastArrayIndex = /^\d+$/.test(last);

  if (isLastArrayIndex) {
    const index = parseInt(last, 10);

    if (!Array.isArray(current)) {
      throw new Error(
        `dotNotationSet: expected array at final segment «${last}» in path «${path}», but got ${typeof current}`,
      );
    }

    current[index] = value;
    return;
  }

  // Обычный объектный ключ
  if (typeof current !== 'object' || current === null) {
    throw new Error(
      `dotNotationSet: expected object at final segment «${last}» in path «${path}», but got ${typeof current}`,
    );
  }

  current[last] = value;
}
