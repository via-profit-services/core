// import { createServer } from 'http';
import chalk from 'chalk';
// import { SubscriptionServer } from 'subscriptions-transport-ws';
import { ServerError } from '~/logger';
import { createServer, IInitProps, getRoutes } from '~/server';

class Core {
  public static init(config: IInitProps) {
    const { port, endpoint, routes, logger } = config;
    const routesList = getRoutes(endpoint, routes);

    // check connection

    // Create listener server by wrapping express app
    const { server, context } = createServer(config);

    const { knex } = context;

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

    server.listen(port, () => {
      console.log('');
      console.log('');
      console.log(chalk.green('========= GraphQL ========='));
      console.log('');
      console.log(`${chalk.green('GraphQL server')}:     ${chalk.yellow(`http://localhost:${port}${endpoint}`)}`);
      console.log(
        `${chalk.magenta('GraphQL playground')}: ${chalk.yellow(`http://localhost:${port}${routesList.playground}`)}`,
      );
      console.log(`${chalk.cyan('Auth Server')}:        ${chalk.yellow(`http://localhost:${port}${routesList.auth}`)}`);
      console.log(
        `${chalk.blue('GraphQL voyager')}:    ${chalk.yellow(`http://localhost:${port}${routesList.voyager}`)}`,
      );
      console.log('');
    });

    return server;
    // const webServer = createServer(s);

    // webServer.listen(port, () => {
    //   // logger.server.debug('Server was started', { port, endpoint, routes });
    //   console.log('');
    //   console.log('');
    //   console.log(chalk.green('========= GraphQL ========='));
    //   console.log('');
    //   console.log(`${chalk.green('GraphQL server')}:     ${chalk.yellow(`http://localhost:${port}${endpoint}`)}`);
    //   console.log(
    //     `${chalk.magenta('GraphQL playground')}: ${chalk.yellow(`http://localhost:${port}${routes.playground}`)}`,
    //   );
    //   console.log(`${chalk.cyan('Auth Server')}:        ${chalk.yellow(`http://localhost:${port}${routes.auth}`)}`);
    //   console.log(`${chalk.blue('GraphQL voyager')}:    ${chalk.yellow(`http://localhost:${port}${routes.voyager}`)}`);
    //   console.log('');

    // Set up the WebSocket for handling GraphQL subscriptions.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // const ss = new SubscriptionServer(
    //   {
    //     execute,
    //     schema,
    //     subscribe,
    //   },
    //   {
    //     path: subscriptionsEndpoint,
    //     server: webServer,
    //   },
    // );
    // });

    // process.on('SIGINT', code => {
    //   logger.server.debug(`Server was stopped (Ctrl-C key passed). Exit with code: ${code}`);
    //   process.exit(2);
    // });
  }
}

export default Core;
export { Core };
// const webServer = server(config: IInitProps);
