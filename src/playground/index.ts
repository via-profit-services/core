import { App } from '~/app';
import catalogSchema from '~/playground/schemas/catalog';
import simpleSchema from '~/playground/schemas/simple';
import { configureApp } from '~/utils/configureApp';

const config = configureApp({ schemas: [simpleSchema, catalogSchema] });
const app = new App(config);
app.bootstrap();
