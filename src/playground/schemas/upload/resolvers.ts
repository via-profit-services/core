import { createWriteStream } from 'fs';
import path from 'path';
import { IResolvers } from 'graphql-tools';

import { IFile } from '../../../schemas/scalar/resolvers/FileUpload/types';
import { IContext } from '../../../types';

interface UploadArgs {
  file: IFile;
}

const resolvers: IResolvers<any, IContext> = {
  Mutation: {
    upload: () => ({}),
  },
  UploadMutation: {
    upload: async (parent, args: UploadArgs) => {
      console.log('args', args);
      const { file } = args;
      const { filename, mimetype, createReadStream } = await file;
      const stream = createReadStream();

      const destinationFilename = path.resolve(__dirname, '../../../../assets/file.txt');
      return stream.pipe(createWriteStream(destinationFilename)).on('close', () => {
        console.log(`filename ${filename}`);
        console.log(`mimetype ${mimetype}`);
        return true;
      });
    },
  },
};

export default resolvers;
