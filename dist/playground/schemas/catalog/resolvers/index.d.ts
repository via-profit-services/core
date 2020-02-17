declare const resolvers: {
    Query: {
        news: () => {};
    };
    Mutation: {
        news: () => {};
    };
    NewsQueries: import("graphql-tools").IResolverObject<any, import("../../../..").IContext, any>;
    NewsMutations: {
        category: () => {};
        item: () => {};
    };
    CategoryMutations: {
        create: () => {
            id: string;
            name: string;
        };
        update: (parent: any, args: any) => {
            id: string;
            name: string;
        };
        delete: () => boolean;
    };
    ItemMutations: {
        create: () => {
            id: string;
            name: string;
            category: number;
            price: number;
        };
        update: (parent: any, args: any) => {
            id: string;
            name: string;
            category: number;
            price: number;
        };
        delete: () => boolean;
    };
};
export default resolvers;
