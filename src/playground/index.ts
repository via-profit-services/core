import { App } from '~/app';
import { serverConfig } from '~/playground/configureApp';

const app = new App(serverConfig);

app.bootstrap();
