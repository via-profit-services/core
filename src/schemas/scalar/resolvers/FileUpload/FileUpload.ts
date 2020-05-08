import { GraphQLScalarType, GraphQLError } from 'graphql';

import UploadInstance from './UploadInstance';

const FileUpload = new GraphQLScalarType({
  name: 'FileUpload',
  description: 'The `Upload` scalar type represents a file upload.',
  parseValue(value) {
    if (value instanceof UploadInstance) {
      return value.promise;
    }

    throw new GraphQLError('Upload value invalid');
  },
  parseLiteral(ast) {
    throw new GraphQLError('Upload literal unsupported', ast);
  },
  serialize() {
    throw new GraphQLError('Upload serialization unsupported');
  },
});

export default FileUpload;
