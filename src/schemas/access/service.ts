import { IContext } from '../../types';
import { REDIS_IP_BLACKLIST } from '../../utils';

export default class AccessService {
  private props: Props;

  public constructor(props: Props) {
    this.props = props;
  }

  public async getBlackList() {
    const { redis } = this.props.context;
    const blackList = await redis.smembers(REDIS_IP_BLACKLIST);

    return blackList;
  }

  public async addToBlackList(ipAddress: string) {
    const { redis } = this.props.context;
    await redis.sadd(REDIS_IP_BLACKLIST, ipAddress);
  }

  public async removeFromBlackList(ipAddress: string) {
    const { redis } = this.props.context;
    await redis.srem(REDIS_IP_BLACKLIST, ipAddress);
  }

  public async clearBlackList() {
    const { redis } = this.props.context;
    await redis.del(REDIS_IP_BLACKLIST);
  }

  public async isInBlackList(ipAddress: string) {
    const { redis } = this.props.context;
    const result = await redis.sismember(REDIS_IP_BLACKLIST, ipAddress);
    return Boolean(result);
  }
}


interface Props {
  context: IContext;
}
