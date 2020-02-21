import { IInitProps } from '~/app';
declare const configureApp: (props: IProps) => IInitProps;
interface IProps {
    schemas: IInitProps['schemas'];
}
export default configureApp;
export { configureApp };
