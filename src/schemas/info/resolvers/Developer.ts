import { IContext, IObjectTypeResolver } from '../../../types';
import { Developer, IDeveloper } from '../service';

const developerResolver: IObjectTypeResolver<Partial<IDeveloper>, IContext> = {
  name: () => Developer.name,
  url: () => Developer.url,
  email: () => Developer.email,
};

export default developerResolver;
