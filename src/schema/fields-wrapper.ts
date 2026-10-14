import { defaultFieldResolver, isIntrospectionType, isObjectType } from 'graphql';
import type {
  MutatedField,
  MutatedObjectType,
  FieldsWrapper,
  ResolversWrapperFunction,
} from './types';

type WrapperResult = Awaited<ReturnType<ResolversWrapperFunction>>;

const isPromiseLike = (value: unknown): value is PromiseLike<unknown> =>
  typeof value === 'object' && value !== null && typeof (value as PromiseLike<unknown>).then === 'function';

/**
 * Wraps resolvers of all fields of all object types of the schema.
 *
 * The wrapper receives `{ resolve, source, args, context, info }` and may
 * return replacements for any of them (or nothing). Then the resolver is
 * called with the (possibly replaced) arguments.
 *
 * Fields without a resolver use graphql-js `defaultFieldResolver`
 * (reads `source[fieldName]`, calls it if it is a function), exactly as
 * graphql-js does for them.
 *
 * Options:
 *   - wrapWithoutResolvers (default true): if false, fields that have no
 *     own resolver are left untouched.
 *
 * Performance: if the wrapper returns a plain value (not a Promise), the
 * resolver is called synchronously. An `async` wrapper around every field
 * would create a Promise for every scalar of every list item.
 *
 * Calling fieldsWrapper twice with different wrappers wraps fields twice
 * (both wrappers run): this is intended.
 */
const fieldsWrapper: FieldsWrapper = (schema, wrapperFunction, options) => {
  const { wrapWithoutResolvers = true } = options || {};
  // One marker per call: protects from wrapping a field twice inside this call
  // (several types may share field objects). Every new call wraps again.
  const processed = Symbol('processed');

  Object.values(schema.getTypeMap()).forEach(type => {
    if (isIntrospectionType(type) || !isObjectType(type)) {
      return;
    }

    const mutatedType = type as unknown as MutatedObjectType & Record<symbol, boolean>;
    if (mutatedType[processed]) {
      return;
    }

    Object.values(type.getFields()).forEach(field => {
      const mutatedField = field as unknown as MutatedField & Record<symbol, boolean>;
      if (mutatedField[processed]) {
        return;
      }

      if (!wrapWithoutResolvers && !field.resolve) {
        return;
      }

      const resolve = field.resolve ?? defaultFieldResolver;

      const callResolver = (res: WrapperResult | void | undefined, source: unknown, args: unknown, context: unknown, info: unknown) => {
        const result = res || {};
        const mutatedResolver = result.resolve || resolve;

        return mutatedResolver(
          (result.source ?? source) as never,
          (result.args ?? args) as never,
          (result.context ?? context) as never,
          (result.info ?? info) as never,
        );
      };

      field.resolve = (source, args, context, info) => {
        const res = wrapperFunction({ resolve, source, args, context, info });

        return isPromiseLike(res)
          ? Promise.resolve(res).then(value => callResolver(value, source, args, context, info))
          : callResolver(res, source, args, context, info);
      };

      mutatedField[processed] = true;
    });

    mutatedType[processed] = true;
  });

  return schema;
};

export default fieldsWrapper;
