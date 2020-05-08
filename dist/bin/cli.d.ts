/// <reference types="node" />
/// <reference types="yargs" />
declare const args: {
    [x: string]: unknown;
    endpoint: string;
    token: string;
    filename: string;
    method?: "POST" | "GET";
    headers?: import("http").OutgoingHttpHeaders;
    _: string[];
    $0: string;
};
export default args;
