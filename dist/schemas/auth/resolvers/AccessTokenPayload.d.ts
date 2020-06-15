import { IResolverObject } from 'graphql-tools';
import { IContext } from '../../../types';
declare const accessTokenPayloadResolver: IResolverObject<{
    type: import("../service").TokenType.access;
    id: string;
    uuid: string;
    roles: string[];
    exp: number;
    iss: string;
}, IContext, any>;
export default accessTokenPayloadResolver;
