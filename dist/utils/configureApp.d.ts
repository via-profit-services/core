import { IInitProps } from '../types';
declare const configureApp: (props?: IProps) => IInitProps;
interface IProps {
    typeDefs?: IInitProps['typeDefs'];
    resolvers?: IInitProps['resolvers'];
    middlewares?: IInitProps['middlewares'];
}
export default configureApp;
export { configureApp };
