import { GraphQLError } from 'graphql';
import { IContext } from '../types';
export declare const customFormatErrorFn: (props: IProps) => {
    message: string;
    locations: readonly import("graphql").SourceLocation[];
    stack: string[];
    path: readonly (string | number)[];
} | {
    message: string;
    locations: readonly import("graphql").SourceLocation[];
    path: readonly (string | number)[];
    stack?: undefined;
};
interface IProps {
    error: GraphQLError;
    context: IContext;
    debug: boolean;
}
export default customFormatErrorFn;
