import { App } from '../app';
import { CronJobManager } from '../utils';
import { configureApp } from '../utils/configureApp';
import catalogSchema from './schemas/catalog';
import simpleSchema from './schemas/simple';

const config = configureApp({ schemas: [simpleSchema, catalogSchema] });
const app = new App(config);
app.bootstrap(() => {
  CronJobManager.addJob('Some job name', {
    cronTime: '*/1 * * * *',
    start: true,
    onTick: () => {
      console.log('Cron job at every 1 min');
    },
  });
});
