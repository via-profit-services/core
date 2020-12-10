import type { Context } from '@via-profit-services/core';

import type { RequestInfo } from '../middleware/graphql-express';
import queryTimeExtension from './query-time';

interface ExtensionsConfig {
  debug?: boolean;
}

type ExtensionsFactory = (
  props: ExtensionsConfig
) => (info: RequestInfo) => {[key: string]: unknown};

const extensionsFactory: ExtensionsFactory = (props) => {
  const { debug } = props;

  const extensionsFn = (info: RequestInfo & { context: Context }) => {
    const params = {
      debug,
      info,
    }

    const response: {[key: string]: any} = {
      ...queryTimeExtension(params),
    };

    return response;
  };

  return extensionsFn;
}

export default extensionsFactory;
