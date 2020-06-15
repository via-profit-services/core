import { job, CronJobParameters, CronJob } from 'cron';
import { BadRequestError } from '../errorHandlers';
import { ILoggerCollection } from '../logger';

/**
 * Cron pool incapsulated container
 */
const cronPool: IPoolManager = {
  pool: new Map<string, CronJob>(),
  logger: undefined,
};

/**
 * CronJob Manager
 * Class for Cron job based on [Node-cron](https://github.com/kelektiv/node-cron) package
 * @see https://github.com/kelektiv/node-cron
 */
class CronJobManager {
  public static configure = (config: IConfig) => {
    const { logger } = config;
    cronPool.logger = logger;
  };

  /**
   * Add new Cronjob
   *
   * @param  {string} jobName Unique job name
   * @param  {CronJobParameters} jobConfig Job options @see https://github.com/kelektiv/node-cron#api
   */
  public static addJob(jobName: string, jobConfig: CronJobParameters) {
    if (cronPool.pool.get(jobName)) {
      throw new BadRequestError(`Cron job with name «${jobName}» already exists`, { jobName });
    }

    // create new cron instance
    const jobInstance = job(jobConfig);

    // log
    if (cronPool.logger) {
      // register log of new job
      cronPool.logger.server.debug(`New Cron job was added with name «${jobName}» at time ${jobConfig.cronTime}`, {
        jobConfig,
      });

      // register tick
      jobInstance.addCallback(() => {
        cronPool.logger.server.debug(`Called Cron job with name «${jobName}» at time ${jobConfig.cronTime}`, {
          jobConfig,
        });
      });
    }

    // save into pool
    cronPool.pool.set(jobName, jobInstance);

    return jobInstance;
  }

  /**
   * Return Cron job by name
   *
   * @param  {string} jobName Name of the job
   * @returns {CronJob|undefined} Job instance
   */
  public static getJob(jobName: string): CronJob | undefined {
    return cronPool.pool.get(jobName);
  }

  /**
   * Get pool list
   * This method returns Map with all job instances
   */
  public static getPool() {
    return cronPool.pool;
  }
}

interface IPoolManager {
  logger?: ILoggerCollection;
  pool: Map<string, CronJob>;
}

/**
 * CronJob manager config
 * This method will be called once
 */
interface IConfig {
  logger: ILoggerCollection;
}

export default CronJobManager;
export { CronJobManager };
