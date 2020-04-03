import { IInitProps, App } from '../app';
import { configureApp } from './configureApp';
import { configureTokens } from './configureTokens';

const configureTest = (config?: Partial<IInitProps>) => {
  const newConfig = {
    ...configureApp(),
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
