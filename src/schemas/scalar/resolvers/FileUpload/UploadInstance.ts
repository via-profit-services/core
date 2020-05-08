
class UploadInstance {
  public promise: Promise<any>;

  public resolve: (file: any) => void;

  public file: any;

  public reject: any;

  constructor() {
    /**
     * Promise that resolves file upload details. This should only be utilized
     * by [`GraphQLUpload`]{@link GraphQLUpload}.
     * @kind member
     * @name Upload#promise
     * @type {Promise<FileUpload>}
     */
    this.promise = new Promise((resolve, reject) => {
      /**
       * Resolves the upload promise with the file upload details. This should
       * only be utilized by [`processRequest`]{@link processRequest}.
       * @kind function
       * @name Upload#resolve
       * @param {FileUpload} file File upload details.
       */
      this.resolve = (file: any) => {
        /**
         * The file upload details, available when the
         * [upload promise]{@link Upload#promise} resolves. This should only be
         * utilized by [`processRequest`]{@link processRequest}.
         * @kind member
         * @name Upload#file
         * @type {undefined|FileUpload}
         */
        this.file = file;

        resolve(file);
      };

      /**
       * Rejects the upload promise with an error. This should only be
       * utilized by [`processRequest`]{@link processRequest}.
       * @kind function
       * @name Upload#reject
       * @param {object} error Error instance.
       */
      this.reject = reject;
    });

    // Prevent errors crashing Node.js, see:
    // https://github.com/nodejs/node/issues/20392
    this.promise.catch(() => {});
  }
}

export default UploadInstance;