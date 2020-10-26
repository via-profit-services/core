import { Winston } from './configureLogger';

const { format } = Winston;

export default format.combine(
  format.metadata(),
  format.json(),
  format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ssZZ' }),
  format.splat(),
  format.printf((info) => {
    const {
      timestamp, level, message, metadata,
    } = info;
    const meta = JSON.stringify(metadata) !== '{}' ? metadata : null;

    return `${timestamp} ${level}: ${message} ${meta ? JSON.stringify(meta) : ''}`;
  }),
);
