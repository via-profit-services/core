import { CronJob } from 'cron';

const job = new CronJob('*/30 * * * * ', () => {
  console.log('Cron job');
});

job.start();
