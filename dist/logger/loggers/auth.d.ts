import { Winston } from '../utils/configureLogger';
declare const _default: (config: Config) => Winston.Logger;
export default _default;
interface Config {
    logDir: string;
}
