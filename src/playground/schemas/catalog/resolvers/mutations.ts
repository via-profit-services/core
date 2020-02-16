import NewsService from '../service';

export const CategoryMutations = {
  create: () => {
    const news = new NewsService();
    return news.getCategory(String(100));
  },
  update: (parent: any, args: any) => {
    const { id } = args;

    const news = new NewsService();
    return news.getCategory(id);
  },
  delete: () => true,
};

export const ItemMutations = {
  create: () => {
    const news = new NewsService();
    return news.getItem(String(1));
  },
  update: (parent: any, args: any) => {
    const { id } = args;

    const news = new NewsService();
    return news.getItem(id);
  },
  delete: () => true,
};
