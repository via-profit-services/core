import { IObjectTypeResolver } from 'graphql-tools';
import { IContext } from '../../../types';
import { IDeveloper } from '../service';
declare const developerResolver: IObjectTypeResolver<Partial<IDeveloper>, IContext>;
export default developerResolver;
