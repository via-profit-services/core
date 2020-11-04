import { Express } from 'express';
import { GraphQLSchema } from 'graphql';
import { withFilter } from 'graphql-subscriptions';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { IInitDefaultProps, IInitProps, IBootstrapCallbackArgs, ISubServerConfig, IContext } from '../types';
declare class App {
    props: IInitDefaultProps;
    constructor(props: IInitProps);
    bootstrap(callback?: (args: IBootstrapCallbackArgs) => void): void;
    createSubscriptionServer(config: ISubServerConfig): SubscriptionServer;
    createApp(): {
        app: Express;
        context: IContext;
        schema: GraphQLSchema;
        routes: IInitProps['routes'];
    };
}
export default App;
export { App, withFilter };
