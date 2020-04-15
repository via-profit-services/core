import { IResolverObject } from 'graphql-tools';

import { IContext } from '../../../app';
import { Developer, IDeveloper } from '../service';

const developerResolver: IResolverObject<Partial<IDeveloper>, IContext> = {
  name: () => Developer.name,
  url: () => Developer.url,
  email: () => Developer.email,
};

export default developerResolver;
