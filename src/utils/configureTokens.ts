import { v4 as uuidv4 } from 'uuid';
import AuthService from '../schemas/auth/service';
import { IContext } from '../types';

const configureTokens = (roles: string[], context: IContext) => {
  const authService = new AuthService({ context });
  const tokens = authService.generateTokens(
    {
      uuid: uuidv4(),
      roles,
    },
    {
      access: 2.592e6,
      refresh: 2.592e6,
    },
  );

  return tokens;
};
export default configureTokens;
export { configureTokens };
