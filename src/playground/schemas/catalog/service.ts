export default class CatalogService {
  private categories = [
    { id: '100', name: 'Category 1' },
    { id: '200', name: 'Category 2' },
    { id: '300', name: 'Category 3' },
    { id: '400', name: 'Category 4' },
  ];

  private items = [
    {
      id: '178900',
      name: 'Item 1',
      category: '100',
      price: 1600.0,
    },
    {
      id: '278900',
      name: 'Item 2',
      category: '100',
      price: 7600.0,
    },
    {
      id: '378900',
      name: 'Item 3',
      category: '100',
      price: 5250.0,
    },
    {
      id: '478900',
      name: 'Item 4',
      category: '200',
      price: 300.0,
    },
    {
      id: '578900',
      name: 'Item 5',
      category: '200',
      price: 652.0,
    },
    {
      id: '678900',
      name: 'Item 6',
      category: '200',
      price: 730.0,
    },
  ];

  public getItemsList() {
    return this.items;
  }

  public getCategoriesList() {
    return this.categories;
  }

  public getItem(id: string) {
    return this.getItemsList().find((i) => i.id === id);
  }

  public getCategory(id: string) {
    return this.getCategoriesList().find((c) => c.id === id);
  }
}
