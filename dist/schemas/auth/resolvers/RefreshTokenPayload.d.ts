import { IContext, IObjectTypeResolver } from '../../../types';
declare const refreshTokenPayloadResolver: IObjectTypeResolver<Pick<{
    type: import("../types").TokenType.access;
    id: string;
    uuid: string;
    roles: string[];
    exp: number;
    iss: string;
}, "id" | "roles" | "uuid" | "exp" | "iss"> & {
    type: import("../types").TokenType.refresh;
    associated: string;
}, IContext, any>;
export default refreshTokenPayloadResolver;
