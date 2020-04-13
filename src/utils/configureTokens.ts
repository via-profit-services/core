import uuidv4 from 'uuid/v4';
import { IContext } from '../app';
import { Authentificator } from '../authentificator/authentificator';

const configureTokens = (roles: string[], context: IContext) => {
  const authentificator = new Authentificator({ context });
  const tokens = authentificator.generateTokens(
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
