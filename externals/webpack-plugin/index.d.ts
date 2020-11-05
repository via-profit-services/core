import { WebpackPluginInstance, Compiler } from 'webpack';

export default class ViaProfitPlugin implements WebpackPluginInstance {
    constructor();

    apply(compiler: Compiler): void;
}