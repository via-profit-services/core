import { IInitProps, App } from '../app';
import * as catalog from '../playground/schemas/catalog';
import * as drivers from '../playground/schemas/drivers';
import { configureApp } from './configureApp';
import { configureTokens } from './configureTokens';

const configureTest = (config?: Partial<IInitProps>) => {
  const newConfig = {
    ...configureApp({
      typeDefs: [catalog.typeDefs, drivers.typeDefs],
      resolvers: [catalog.resolvers, catalog.resolvers],
    }),
    ...config,
  };

  const app = new App(newConfig);
  const appData = app.createApp();
  const tokenData = configureTokens([], appData.context);

  return {
    ...appData,
    ...tokenData,
    config: newConfig,
  };
};

export default configureTest;
