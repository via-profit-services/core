import { App } from '~/app';
import { serverConfig } from '~/playground/configureApp';

const app = new App({
  ...serverConfig,
  port: 4000,
  usePlayground: true,
});

app.createApp();
app.createServer();
app.startServer();
