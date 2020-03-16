import { IResolverObject } from 'graphql-tools';
import { IContext } from '../../../../app';
import CatalogService from '../service';

export const CatalogQueries: IResolverObject<any, IContext> = {
  categories: (source, args, context) => {
    const { logger } = context;

    logger.catalog.debug('Returns categories list');

    const news = new CatalogService();
    return news.getCategoriesList();
  },
  item: (source, args, context) => {
    const { id } = args;
    const { logger } = context;

    logger.catalog.debug('Returns Item');

    const catalogService = new CatalogService();
    return catalogService.getItemsList().find(i => i.id === String(id));
  },
  items: async () => {
    const catalogService = new CatalogService();
    const items = catalogService.getItemsList();

    return items;
  },
};

export default CatalogQueries;
