import { IContext } from '../../types';
export default class AccessService {
    private props;
    constructor(props: Props);
    getBlackList(): Promise<string[]>;
    addToBlackList(ipAddress: string): Promise<void>;
    removeFromBlackList(ipAddress: string): Promise<void>;
    clearBlackList(): Promise<void>;
    isInBlackList(ipAddress: string): Promise<boolean>;
}
interface Props {
    context: IContext;
}
export {};
