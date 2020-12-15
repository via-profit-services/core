import type { IObjectTypeResolver } from '@graphql-tools/utils';
import type { Context } from '@via-profit-services/core';


const InfoQuery: IObjectTypeResolver<any, Context> = {
  developer: (parent, args, context) =>
    // console.log(context);

     ({})
  ,
};

export default InfoQuery;
