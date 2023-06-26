# File uploads in @via-profit-services/core

No info

Example:

```ts
const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    uploadFiles: {
      description: 'Upload files and get their location, mimeType and size',
      type: new GraphQLNonNull(
        new GraphQLList(
          new GraphQLNonNull(
            new GraphQLObjectType({
              name: 'UploadedFilePayload',
              fields: {
                location: { type: new GraphQLNonNull(GraphQLString) },
                mimeType: { type: new GraphQLNonNull(GraphQLString) },
                size: { type: new GraphQLNonNull(GraphQLInt) },
              },
            }),
          ),
        ),
      ),
      args: {
        files: {
          type: new GraphQLNonNull(
            new GraphQLList(
              new GraphQLNonNull(
                // This is where the FileUploadScalarType scalar is used
                FileUploadScalarType,
              ),
            ),
          ),
        },
      },
      resolve: async (_parent, args: { files: UploadedFile[] }) => {
        const { files } = args;

        // Just response data array
        const response: {
          location: string;
          mimeType: string;
        }[] = [];

        // Don't forget call this promise
        // Uploading files is an asynchronous operation
        const filesData = await Promise.all(files);

        // Now you can read the files
        await filesData.reduce(async (prev, file) => {
          await prev;

          const readStream = file.createReadStream();
          const fileExt = file.mimeType.replace(/\//, '');
          const filename = `${Date.now()}.${fileExt}`;
          const location = path.resolve(__dirname, `./files/${filename}`);

          fs.mkdirSync(path.dirname(location), { recursive: true });
          const writeStream = fs.createWriteStream(location);

          const writeFile = new Promise<void>(resolve => {
            writeStream.on('close', async () => {
              file.capacitor.destroy();
              response.push({
                location,
                mimeType: file.mimeType,
              });
              resolve();
            });

            readStream.pipe(writeStream);
          });

          await writeFile;
        }, Promise.resolve());

        return response;
      },
    },
  },
});
```