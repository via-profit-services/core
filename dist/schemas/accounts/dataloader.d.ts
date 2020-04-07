import { IContext } from '../../app';
import { IAccount } from '../../authentificator';
import { Node, DataLoader } from '../../utils';
interface Loaders {
    accounts: DataLoader<string, Node<IAccount>>;
}
export default function createLoaders(context: IContext): Loaders;
export {};
