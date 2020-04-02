import { DEV_INFO_DEVELOPER_NAME, DEV_INFO_DEVELOPER_URL } from '../../utils/constants';


export const Developer = {
  name: DEV_INFO_DEVELOPER_NAME,
  url: DEV_INFO_DEVELOPER_URL,
};

export interface IDeveloper {
  name: string;
  url: string;
}
