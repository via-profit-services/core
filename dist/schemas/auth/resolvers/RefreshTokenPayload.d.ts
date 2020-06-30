import { IResolverObject } from 'graphql-tools';
import { IContext } from '../../../types';
declare const refreshTokenPayloadResolver: IResolverObject<Pick<{
    type: import("../service").TokenType.access;
    id: string;
    uuid: string;
    roles: string[];
    exp: number;
    iss: string;
}, "id" | "roles" | "uuid" | "exp" | "iss"> & {
    type: import("../service").TokenType.refresh;
    associated: string;
}, IContext, any>;
export default refreshTokenPayloadResolver;
