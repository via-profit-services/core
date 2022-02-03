import { GraphQLScalarType, GraphQLError } from 'graphql';

import FileUploadInstance from '../../utils/FileUploadInstance';

const FileUpload = new GraphQLScalarType({
  name: 'FileUpload',
  description:
    'A GraphQL `FileUpload` scalar as specified GraphQL multipart request specification: https://github.com/jaydenseric/graphql-multipart-request-spec#graphql-multipart-request-specification',
  parseValue(value) {
    if (value instanceof FileUploadInstance) {
      return value.promise;
    }

    throw new GraphQLError('Upload value invalid', {});
  },
  parseLiteral(ast) {
    throw new GraphQLError('Upload literal unsupported', { nodes: [ast] });
  },
  serialize() {
    throw new GraphQLError('Upload serialization unsupported', {});
  },
});

export default FileUpload;
