/* eslint-disable import/max-dependencies */
import { GraphQLSchema } from 'graphql';

import { JSON as JSONType, JSONObject as JSONObjectType } from './scalars/JSON';
import DateType from './scalars/Date';
import DateTimeType from './scalars/DateTime';
import EmailAddressType from './scalars/EmailAddress';
import MoneyType from './scalars/Money';
import TimeType from './scalars/Time';
import VoidType from './scalars/Void';
import URLType from './scalars/URL';
import BetweenDateType from './inputs/BetweenDate';
import BetweenDateTimeType from './inputs/BetweenDateTime';
import BetweenIntType from './inputs/BetweenInt';
import BetweenMoneyType from './inputs/BetweenMoney';
import BetweenTimeType from './inputs/BetweenTime';
import ConnectionType from './interfaces/Connection';
import EdgeType from './interfaces/Edge';
import ErrorType from './interfaces/Error';
import NodeType from './interfaces/Node';
import Query from './Query';

const schema = new GraphQLSchema({
  query: Query,
  types: [
    DateType,
    DateTimeType,
    EmailAddressType,
    MoneyType,
    TimeType,
    VoidType,
    URLType,
    JSONType,
    JSONObjectType,
    BetweenDateType,
    BetweenDateTimeType,
    BetweenIntType,
    BetweenMoneyType,
    BetweenTimeType,
    ConnectionType,
    EdgeType,
    ErrorType,
    NodeType,
  ],
});

export {
  schema,
  DateType,
  DateTimeType,
  EmailAddressType,
  MoneyType,
  TimeType,
  VoidType,
  URLType,
  BetweenDateType,
  BetweenDateTimeType,
  BetweenIntType,
  BetweenMoneyType,
  BetweenTimeType,
  ConnectionType,
  EdgeType,
  ErrorType,
  NodeType,
  JSONType,
  JSONObjectType,
};
