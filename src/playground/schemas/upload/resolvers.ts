import { createWriteStream } from 'fs';
import path from 'path';
import { IResolvers } from 'graphql-tools';

import { IFile } from '../../../schemas/scalar/resolvers/FileUpload/types';
import { IContext } from '../../../types';

interface UploadArgs {
  file: IFile;
  info: {
    name: string;
  };
}

const resolvers: IResolvers<any, IContext> = {
  Mutation: {
    upload: () => ({}),
  },
  UploadMutation: {
    upload: async (parent, args: UploadArgs) => {
      const { file } = args;
      const { filename, mimeType, createReadStream } = await file;
      const stream = createReadStream();

      const destinationFilename = path.resolve(__dirname, '../../../../assets/file.txt');
      return new Promise((resolve) => {
        stream.pipe(createWriteStream(destinationFilename)).on('close', () => {
          console.log(`filename ${filename}`);
          console.log(`mimetype ${mimeType}`);
          resolve(true);
        });
      });
    },
  },
};

export default resolvers;
