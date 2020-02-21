import uuidv4 from 'uuid/v4';
import { IContext } from '~/app';
import { Authentificator } from '~/authentificator';

const configureTokens = (roles: string[], context: IContext) => {
  const authentificator = new Authentificator({ context });
  const tokens = authentificator.generateTokens({
    uuid: uuidv4(),
    roles,
  });

  return tokens;
};
export default configureTokens;
export { configureTokens };
