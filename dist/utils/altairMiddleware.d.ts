export declare const altairMiddleware: (props: IProps) => import("express-serve-static-core").Router;
interface IProps {
    endpoint: string;
    subscriptionEndpoint: string;
}
export default altairMiddleware;
