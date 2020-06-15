import { IResolverObject } from 'graphql-tools';

import { IContext } from '../../../types';
import AuthService from '../service';

const authQueryResolver: IResolverObject<any, IContext> = {
  validateToken: async (parent, args: IValidateTokenArgs, context) => {
    const { token } = args;
    const authService = new AuthService({ context });
    try {
      const tokenPayload = await authService.verifyToken(token);
      return tokenPayload || null;
    } catch (err) {
      return null;
    }
  },
};

interface IValidateTokenArgs {
  token: string;
}

export default authQueryResolver;
