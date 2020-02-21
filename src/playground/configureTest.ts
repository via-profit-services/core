import { IInitProps, App } from '~/app';
import { serverConfig } from '~/playground/configureApp';
import { configureTokens } from '~/utils/configureTokens';

const configureTest = (config?: Partial<IInitProps>) => {
  const newConfig = {
    ...serverConfig,
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
