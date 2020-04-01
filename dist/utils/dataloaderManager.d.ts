import DataLoader from 'dataloader';
export declare const resolveByDataLoader: <K, V>(id: K, key: keyof V, dataloader: DataLoader<K, V, K>) => Promise<V[keyof V]>;
export { DataLoader };
