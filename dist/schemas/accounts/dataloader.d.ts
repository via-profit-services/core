import { IContext } from '../../app';
import { IAccount } from '../../authentificator';
import { Node, DataLoader } from '../../utils';
export default function createDataloader(context: IContext): DataLoader<string, Node<IAccount>, string>;
