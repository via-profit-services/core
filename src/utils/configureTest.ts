import { IInitProps, App } from '~/app';
import { serverConfig } from '~/playground/configureApp';
import { configureTokens } from '~/utils/configureToken';

const configureTest = (config?: Partial<IInitProps>) => {
  const newConfig = { ...serverConfig, ...{ port: 4001 }, ...config };
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
