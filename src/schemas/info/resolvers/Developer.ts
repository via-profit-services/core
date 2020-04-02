import { IResolverObject } from 'graphql-tools';

import { IContext } from '../../../app';
import { Developer, IDeveloper } from '../service';

const developerResolver: IResolverObject<Partial<IDeveloper>, IContext> = {
  name: (developer) => {
    const dev = { ...Developer, ...developer };
    return dev.name;
  },
  url: (developer) => {
    const dev = { ...Developer, ...developer };
    return dev.url;
  },
};

export default developerResolver;
