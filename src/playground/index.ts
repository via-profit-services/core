import { App } from '../app';
import { configureApp } from '../utils/configureApp';
import catalogSchema from './schemas/catalog';
import simpleSchema from './schemas/simple';

const config = configureApp({ schemas: [simpleSchema, catalogSchema] });
const app = new App(config);
app.bootstrap();
