import DataLoader from 'dataloader';
export declare const resolveByDataLoader: <K, V>(id: K, key: keyof V, dataloader: DataLoader<K, V, K>) => Promise<V[keyof V]>;
export declare const dataloaderManager: {
    set: <K, V>(key: string, dataloader: DataLoader<K, V, K>, forseSet?: boolean) => void;
    get: <K_1, V_1>(key: string) => DataLoader<K_1, V_1, K_1>;
    has: (key: string) => boolean;
    resolveByDataLoader: <K_2, V_2>(id: K_2, key: keyof V_2, dataloader: DataLoader<K_2, V_2, K_2>) => Promise<V_2[keyof V_2]>;
};
export { DataLoader };
