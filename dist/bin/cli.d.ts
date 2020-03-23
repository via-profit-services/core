/// <reference types="yargs" />
declare const args: {
    [x: string]: unknown;
    [x: number]: unknown;
    migrations: boolean;
    seeds: boolean;
    _: string[];
    $0: string;
};
export default args;
