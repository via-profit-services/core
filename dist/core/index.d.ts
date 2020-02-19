/// <reference types="node" />
import { IInitProps } from '~/app';
declare class Core {
    static init(config: IInitProps): import("http").Server;
}
export default Core;
export { Core };
