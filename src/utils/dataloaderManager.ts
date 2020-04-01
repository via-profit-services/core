import DataLoader from 'dataloader';

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


export { DataLoader };
