import { IInitProps } from '~/server';
declare class Core {
    static init(config: IInitProps): import("express-serve-static-core").Express;
}
export default Core;
export { Core };
