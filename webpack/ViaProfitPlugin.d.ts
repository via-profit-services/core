import { WebpackPluginInstance, Compiler } from 'webpack';

export namespace ViaProfitPlugin {

}

export default class ViaProfitPlugin implements WebpackPluginInstance {
    constructor();

    apply(compiler: Compiler): void;
}