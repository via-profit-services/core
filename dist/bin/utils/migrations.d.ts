export declare const listMigrationsPerPackage: () => {
    project: string;
    files: {
        migrations: string[];
        seeds: string[];
    };
}[];
export declare const getMigrations: (params: {
    migrations: boolean;
    seeds: boolean;
}) => void;
export declare const resolveKnexfile: (knexfile: string) => string;
export declare const execKnex: (knexCommand: string, knexfile: string) => Promise<unknown>;
