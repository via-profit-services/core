import { IInitProps } from '../app';
declare const configureApp: (props?: IProps) => IInitProps;
interface IProps {
    typeDefs: IInitProps['typeDefs'];
    resolvers: IInitProps['resolvers'];
}
export default configureApp;
export { configureApp };
