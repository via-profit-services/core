import { IInitProps, App } from '../app';
import CatalogSchema from '../playground/schemas/catalog';
import SimpleSchema from '../playground/schemas/simple';
import { configureApp } from './configureApp';
import { configureTokens } from './configureTokens';

const configureTest = (config?: Partial<IInitProps>) => {
  const newConfig = {
    ...configureApp({ schemas: [SimpleSchema, CatalogSchema] }),
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
