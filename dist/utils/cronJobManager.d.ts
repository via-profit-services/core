import { CronJobParameters, CronJob } from 'cron';
import { ILoggerCollection } from '../logger';
/**
 * CronJob Manager
 * Class for Cron job based on [Node-cron](https://github.com/kelektiv/node-cron) package
 * @see https://github.com/kelektiv/node-cron
 */
declare class CronJobManager {
    static configure: (config: IConfig) => void;
    /**
     * Add new Cronjob
     *
     * @param  {string} jobName Unique job name
     * @param  {CronJobParameters} jobConfig Job options @see https://github.com/kelektiv/node-cron#api
     */
    static addJob(jobName: string, jobConfig: CronJobParameters): CronJob;
    /**
     * Return Cron job by name
     *
     * @param  {string} jobName Name of the job
     * @returns {CronJob|undefined} Job instance
     */
    static getJob(jobName: string): CronJob | undefined;
    /**
     * Get pool list
     * This method returns Map with all job instances
     */
    static getPool(): Map<string, CronJob>;
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
