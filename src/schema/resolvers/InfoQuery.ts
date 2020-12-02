import { DEV_INFO_DEVELOPER_EMAIL, DEV_INFO_DEVELOPER_NAME, DEV_INFO_DEVELOPER_URL } from '../../constants';

const InfoQuery = {
  developer: () => ({
    name: () => DEV_INFO_DEVELOPER_NAME,
    url: () => DEV_INFO_DEVELOPER_URL,
    email: () => DEV_INFO_DEVELOPER_EMAIL,
  }),
};

export default InfoQuery;
