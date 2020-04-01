import DataLoader from 'dataloader';
import { IContext } from '../app';
import { Node } from './generateCursorBundle';
export declare const dataloaderManager: {
    set: <K, V>(key: string, dataloader: DataLoader<K, V, K>, forseSet?: boolean) => void;
    get: <K_1, V_1>(key: string) => DataLoader<K_1, V_1, K_1>;
    has: (key: string) => boolean;
    resolveByDataLoader: <K_2, V_2>(id: K_2, key: keyof V_2, dataloader: DataLoader<K_2, V_2, K_2>) => Promise<V_2[keyof V_2]>;
    createOrGetDataloader: <K_3, V_3>(context: IContext, key: string, createDataloaderFn: (context: IContext) => DataLoader<K_3, V_3, K_3>) => DataLoader<K_3, V_3, K_3>;
    resolveObject: <K_4 extends string, V_4>(fields: ("id" | "createdAt" | keyof V_4)[], loaderFactory: (context: IContext) => DataLoader<K_4, Node<V_4>, K_4>) => any;
};
export { DataLoader };
