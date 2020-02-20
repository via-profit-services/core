import { createServer } from 'http';
import chalk from 'chalk';
import { execute, subscribe } from 'graphql';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { App, IInitProps } from '~/app';
import { ServerError } from '~/logger';

class Core {
  public static init(config: IInitProps) {
    const { port, endpoint, subscriptionsEndpoint, logger } = config;

    // Create web application by wrapping express app
    const { app, context, schema, routes } = App.createApp(config);

    // Create web server
    const server = createServer(app);

    // configure knex query builder
    const { knex } = context;

    // check database connection
    knex
      .raw('SELECT 1+1 AS result')
      .then(() => {
        logger.server.debug('Test the connection by trying to authenticate is OK');
        return true;
      })
      .catch(err => {
        logger.server.error(err.name, err);
        throw new ServerError(err);
      });

    // Run HTTP server
    server.listen(port, () => {
      // connect websockrt subscriptions werver
      // @see https://github.com/apollographql/subscriptions-transport-ws/blob/master/docs/source/express.md
      // eslint-disable-next-line no-new
      new SubscriptionServer(
        {
          execute,
          schema,
          subscribe,
        },
        {
          server,
          path: subscriptionsEndpoint,
        },
      );

      console.log('');
      console.log('');
      console.log(chalk.green('========= GraphQL ========='));
      console.log('');
      console.log(`${chalk.green('GraphQL server')}:     ${chalk.yellow(`http://localhost:${port}${endpoint}`)}`);
      console.log(
        `${chalk.magenta('GraphQL playground')}: ${chalk.yellow(`http://localhost:${port}${routes.playground}`)}`,
      );
      console.log(`${chalk.cyan('Auth Server')}:        ${chalk.yellow(`http://localhost:${port}${routes.auth}`)}`);
      console.log(`${chalk.blue('GraphQL voyager')}:    ${chalk.yellow(`http://localhost:${port}${routes.voyager}`)}`);
      console.log('');
    });

    return server;
  }
}

export default Core;
export { Core };
