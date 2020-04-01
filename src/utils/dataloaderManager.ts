import DataLoader from 'dataloader';

const dataloaders = new Map();

export const resolveByDataLoader = async <K, V>(
  id: K,
  key: keyof V,
  dataloader: DataLoader<K, V>) => {
  const data = await dataloader.load(id);

  if (!data) {
    throw new Error(`Element not found in dataloader with key «${String(key)}»`);
  }

  return typeof data[key] !== 'undefined' ? data[key] : null;
};


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
  resolveByDataLoader,
};


export { DataLoader };
