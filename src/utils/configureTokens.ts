import uuidv4 from 'uuid/v4';
import { IContext } from '../app';
import { Authentificator } from '../authentificator/authentificator';

const configureTokens = (roles: string[], context: IContext) => {
  const authentificator = new Authentificator({ context });
  const tokens = authentificator.generateTokens(
    {
      id: uuidv4(),
      roles,
    },
    {
      access: 86400,
      refresh: 86400,
    },
  );

  return tokens;
};
export default configureTokens;
export { configureTokens };
