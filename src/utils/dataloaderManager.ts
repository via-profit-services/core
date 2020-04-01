/* eslint-disable max-len */
import DataLoader from 'dataloader';
import { IContext } from '../app';
import { Node } from './generateCursorBundle';

const dataloaders = new Map();


export const dataloaderManager = {
  set: <K, V>(
    key: string,
    dataloader: DataLoader<K, V>,
    forseSet: boolean = false) => {
    if (!forseSet && (!dataloaderManager.has(key))) {
      dataloaders.set(key, dataloader);
    }
  },
  // eslint-disable-next-line arrow-body-style
  get: <K, V>(key: string): DataLoader<K, V> | undefined => {
    return dataloaders.get(key);
  },
  has: (key: string) => dataloaders.has(key),
  resolveKey: async <K, V>(
    id: K,
    key: keyof V,
    dataloader: DataLoader<K, V>) => {
    const data = await dataloader.load(id);

    if (!data) {
      throw new Error(`Element not found in dataloader with key «${String(key)}»`);
    }

    return typeof data[key] !== 'undefined' ? data[key] : null;
  },
  // eslint-disable-next-line max-len
  createOrGetDataloader: <K, V>(context: IContext, key: string, createDataloaderFn: (context: IContext) => DataLoader<K, V>) => {
    if (!dataloaderManager.get<K, V>(key)) {
      dataloaderManager.set(key, createDataloaderFn(context));
    }

    return dataloaderManager.get<K, V>(key);
  },
  resolveObject: <K extends string, V>(
    fields: Array<keyof Node<V>>,
    loaderFactory: (context: IContext) => DataLoader<K, Node<V>>) => {
    const r: any = {};
    fields.forEach((field) => {
      r[field] = async ({ id }: Pick<Node<V>, 'id'>, args: any, context: IContext) => {
        const loader = dataloaderManager.createOrGetDataloader<K, Node<V>>(context, 'drivers', loaderFactory);
        const value = await dataloaderManager.resolveKey<string, Node<V>>(id, field, loader);
        return value;
      };
    });
    return r;
  },
};


export { DataLoader };
