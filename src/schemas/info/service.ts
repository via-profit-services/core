import {
  DEV_INFO_DEVELOPER_NAME,
  DEV_INFO_DEVELOPER_URL,
  DEV_INFO_DEVELOPER_EMAIL,
} from '../../utils/constants';


export const Developer = {
  name: DEV_INFO_DEVELOPER_NAME,
  url: DEV_INFO_DEVELOPER_URL,
  email: DEV_INFO_DEVELOPER_EMAIL,
};

export interface IDeveloper {
  name: string;
  url: string;
  email: string;
}
