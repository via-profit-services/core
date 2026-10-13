import { Kind, parseValue as parseAST } from 'graphql';

import {
  BigIntScalarType,
  DateTimeScalarType,
  JSONObjectScalarType,
  MoneyScalarType,
  TimeScalarType,
  URLScalarType,
} from '../index';

const fails = (fn: () => unknown) => expect(fn).toThrow();

describe('DateTime', () => {
  test('input: ISO-UTC only, real calendar dates only', () => {
    expect(DateTimeScalarType.parseValue('2026-03-05T10:15:20.123Z')).toEqual(
      new Date(Date.UTC(2026, 2, 5, 10, 15, 20, 123)),
    );
    fails(() => DateTimeScalarType.parseValue('2026-03-05T10:15:20')); // no zone
    fails(() => DateTimeScalarType.parseValue('2026-03-05T10:15:20+05:00'));
    fails(() => DateTimeScalarType.parseValue('2026-02-30T00:00:00Z')); // would become March 2
    fails(() => DateTimeScalarType.parseValue('1'));
  });

  test('input: millisecond timestamps, including dates before 2001 and 1970', () => {
    expect(DateTimeScalarType.parseValue(946684800000)).toEqual(new Date('2000-01-01T00:00:00Z'));
    expect(DateTimeScalarType.parseValue(-631152000000)).toEqual(new Date('1950-01-01T00:00:00Z'));
    fails(() => DateTimeScalarType.parseValue(1772712000)); // seconds
  });

  test('output: any valid date representation', () => {
    expect(DateTimeScalarType.serialize(new Date('2026-01-01T00:00:00Z'))).toBe('2026-01-01T00:00:00.000Z');
    expect(DateTimeScalarType.serialize('2026-01-01 05:00:00+05')).toBe('2026-01-01T00:00:00.000Z');
    fails(() => DateTimeScalarType.serialize('not a date'));
  });
});

describe('Money', () => {
  test('only decimal integer strings', () => {
    expect(MoneyScalarType.parseValue('25000')).toBe(25000n);
    expect(MoneyScalarType.parseValue('-100')).toBe(-100n);
    for (const bad of ['', ' 12 ', '0x10', '0b1', '1.5', '1e3', '+5']) {
      fails(() => MoneyScalarType.parseValue(bad));
    }
    fails(() => MoneyScalarType.parseValue(100));
    fails(() => MoneyScalarType.parseLiteral(parseAST('100'), {}));
  });

  test('serialize', () => {
    expect(MoneyScalarType.serialize(250n)).toBe('250');
    expect(MoneyScalarType.serialize('250')).toBe('250');
    expect(MoneyScalarType.serialize(250)).toBe('250');
    fails(() => MoneyScalarType.serialize('abc'));
    fails(() => MoneyScalarType.serialize(1.5));
  });
});

describe('Time', () => {
  test('valid values are normalized to HH:MM:SS', () => {
    expect(TimeScalarType.parseValue('9:05')).toBe('09:05:00');
    expect(TimeScalarType.parseValue('09:05')).toBe('09:05:00');
    expect(TimeScalarType.parseValue('23:59:59')).toBe('23:59:59');
    expect(TimeScalarType.parseValue('24:00')).toBe('24:00:00');
    expect(TimeScalarType.serialize('7:30')).toBe('07:30:00');
  });

  test('invalid values', () => {
    for (const bad of ['24:59', '24:00:01', '25:00', '12:60', '12:00:60', '1200', '']) {
      fails(() => TimeScalarType.parseValue(bad));
    }
  });
});

describe('URL', () => {
  test('script URLs are rejected', () => {
    expect(String(URLScalarType.parseValue('https://example.com/a?b=1'))).toBe('https://example.com/a?b=1');
    fails(() => URLScalarType.parseValue('javascript:alert(1)'));
    fails(() => URLScalarType.parseValue('JavaScript:alert(1)'));
    fails(() => URLScalarType.parseValue('vbscript:msgbox(1)'));
    fails(() => URLScalarType.parseValue('not a url'));
    fails(() => URLScalarType.parseValue(42));
  });
});

describe('BigInt', () => {
  test('integers only, errors are GraphQL errors', () => {
    expect(BigIntScalarType.parseValue('9007199254740993')).toBe(9007199254740993n);
    expect(BigIntScalarType.parseValue(42)).toBe(42n);
    expect(BigIntScalarType.parseLiteral({ kind: Kind.INT, value: '7' }, {})).toBe(7n);
    for (const bad of [1.5, 'abc', '1.5', null, {}, '9'.repeat(101)]) {
      expect(() => BigIntScalarType.parseValue(bad)).toThrow(/BigInt cannot represent/);
    }
    fails(() => BigIntScalarType.parseLiteral(parseAST('true'), {}));
  });
});

describe('JSONObject', () => {
  test('literals must be objects', () => {
    expect(JSONObjectScalarType.parseLiteral(parseAST('{ a: 1 }'), {})).toEqual({ a: 1 });
    fails(() => JSONObjectScalarType.parseLiteral(parseAST('[1]'), {}));
    fails(() => JSONObjectScalarType.parseLiteral(parseAST('"str"'), {}));
  });
});
