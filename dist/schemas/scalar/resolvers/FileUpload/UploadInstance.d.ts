declare class UploadInstance {
    promise: Promise<any>;
    resolve: (file: any) => void;
    file: any;
    reject: any;
    constructor();
}
export default UploadInstance;
