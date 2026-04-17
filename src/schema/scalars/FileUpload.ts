import { GraphQLError, GraphQLScalarType } from "graphql";
import FileUploadInstance from "../../utils/FileUploadInstance";

/**
 * GraphQL `FileUpload` scalar.
 *
 * This scalar implements the behavior defined in the
 * GraphQL multipart request specification:
 * https://github.com/jaydenseric/graphql-multipart-request-spec
 *
 * Important notes for developers:
 *
 * - This scalar does NOT accept literal values in GraphQL queries.
 *   Uploads must always be sent via multipart/form-data.
 *
 * - During multipart parsing, each file field is converted into a
 *   `FileUploadInstance`, which exposes a `.promise` resolving to a
 *   `FilePayload` object.
 *
 * - The scalar returns `UploadedFile` (Promise<FilePayload>), so resolvers
 *   MUST `await` the value before accessing file metadata or streams.
 *
 * - Serialization is intentionally unsupported because uploaded files
 *   cannot be sent back to the client as scalar values.
 *
 * - If a client attempts to send an upload literal (e.g. `file: "abc"`),
 *   the scalar throws a GraphQLError.
 */
const FileUpload = new GraphQLScalarType({
  name: 'FileUpload',
  description:
    'A GraphQL `FileUpload` scalar as specified by the GraphQL multipart request specification: ' +
    'https://github.com/jaydenseric/graphql-multipart-request-spec#graphql-multipart-request-specification',

  /**
   * Called when a value is provided via variables (multipart parser).
   *
   * The multipart parser injects a `FileUploadInstance` for each file.
   * We return its `.promise`, which resolves to a `FilePayload`.
   */
  parseValue(value) {
    if (value instanceof FileUploadInstance) {
      return value.promise;
    }

    // If the value is not a FileUploadInstance, the client sent invalid data.
    throw new GraphQLError('Upload value invalid');
  },

  /**
   * Upload literals are not supported.
   * Example of unsupported usage:
   *   mutation { upload(file: "abc") }
   */
  parseLiteral(ast) {
    throw new GraphQLError('Upload literal unsupported', { nodes: [ast] });
  },

  /**
   * Serialization is not supported because uploaded files cannot be
   * represented as scalar output values.
   */
  serialize() {
    throw new GraphQLError('Upload serialization unsupported');
  },
});

export default FileUpload;
