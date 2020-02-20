import 'winston-daily-rotate-file';
declare const _default: (config: Config) => import("winston").Logger;
export default _default;
interface Config {
    logPath: string;
}
