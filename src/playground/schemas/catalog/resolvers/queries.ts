import { IResolverObject } from 'graphql-tools';
import NewsService from '../service';
import { IContext } from '~/index';

export const NewsQueries: IResolverObject<any, IContext> = {
  categories: (source, args, context) => {
    const { logger } = context;

    logger.catalog.debug('Returns categories list');

    const news = new NewsService();
    return news.getCategoriesList();
  },
  item: (source, args, context) => {
    const { id } = args;
    const { logger } = context;

    logger.catalog.debug('Returns Item');

    const news = new NewsService();
    return news.getItemsList().find(i => i.id === String(id));
  },
  items: (source, args, context) => {
    const { logger } = context;

    const news = new NewsService();

    logger.catalog.debug('Returns Items list');
    return news.getItemsList();
  },
};

export default NewsQueries;
