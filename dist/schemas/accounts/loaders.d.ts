import { IContext } from '../../app';
import { Node, DataLoader } from '../../utils';
import { IAccount } from './service';
interface Loaders {
    accounts: DataLoader<string, Node<IAccount>>;
}
export default function createLoaders(context: IContext): Loaders;
export {};
