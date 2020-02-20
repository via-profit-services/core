import { Core } from '~/index';
import { serverConfig } from '~/playground/configureApp';

Core.init({
  ...serverConfig,
  port: 4000,
});
