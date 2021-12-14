/* eslint-disable import/max-dependencies */
import { JSON as JSONScalarType, JSONObject as JSONObjectScalarType } from './scalars/JSON';
import FileUploadScalarType from './scalars/FileUpload';
import DateScalarType from './scalars/Date';
import DateTimeScalarType from './scalars/DateTime';
import EmailAddressScalarType from './scalars/EmailAddress';
import MoneyScalarType from './scalars/Money';
import TimeScalarType from './scalars/Time';
import VoidScalarType from './scalars/Void';
import URLScalarType from './scalars/URL';
import BetweenDateInputType from './inputs/BetweenDate';
import BetweenDateTimeInputType from './inputs/BetweenDateTime';
import BetweenIntInputType from './inputs/BetweenInt';
import BetweenMoneyInputType from './inputs/BetweenMoney';
import BetweenTimeInputType from './inputs/BetweenTime';
import ConnectionInterfaceType from './interfaces/Connection';
import EdgeInterfaceType from './interfaces/Edge';
import ErrorInterfaceType from './interfaces/Error';
import NodeInterfaceType from './interfaces/Node';

export {
  // scalars
  FileUploadScalarType,
  DateScalarType,
  DateTimeScalarType,
  EmailAddressScalarType,
  MoneyScalarType,
  TimeScalarType,
  VoidScalarType,
  URLScalarType,
  JSONScalarType,
  JSONObjectScalarType,
  // inputs
  BetweenDateInputType,
  BetweenDateTimeInputType,
  BetweenIntInputType,
  BetweenMoneyInputType,
  BetweenTimeInputType,
  // interfaces
  ConnectionInterfaceType,
  EdgeInterfaceType,
  ErrorInterfaceType,
  NodeInterfaceType,
};
