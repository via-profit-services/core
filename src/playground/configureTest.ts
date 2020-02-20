import { IInitProps, App } from '~/index';
import { serverConfig } from '~/playground/configureApp';
import { configureTokens } from '~/playground/configureToken';

const configureTest = (config?: Partial<IInitProps>) => {
  const newConfig = { ...serverConfig, ...{ port: 4001 }, ...config };
  const appData = App.createApp(newConfig);
  const tokenData = configureTokens([], appData.context);

  return {
    ...appData,
    ...tokenData,
    config: newConfig,
  };
};

export default configureTest;
