import gql from 'graphql-tag';

const schema = gql`
  type Query {
    info: InfoQuery!
  }

  type Mutation {
    info: InfoMutation!
  }

  type Subscription {
    info: String!
  }

  type InfoQuery {
    developer: Developer!
  }

  type Developer {
    name: String!
    url: URL!
    email: EmailAddress!
  }

  type InfoMutation {
    echo(str: String!): String!
  }

  """
  Standart ordering options
  """
  enum OrderDirection {
    ASC
    DESC
  }

  """
  Error handle interface
  """
  interface Error {
    """
    Error name. Can be short error message
    """
    name: String!

    """
    Error detail message string
    """
    msg: String
  }

  """
  Information about pagination in a connection.
  """
  type PageInfo {
    hasPreviousPage: Boolean!
    hasNextPage: Boolean!
    startCursor: String
    endCursor: String
  }

  """
  GraphQL Node spec. interface
  """
  interface Node {
    id: ID!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  """
  GraphQL Edge spec. interface
  """
  interface Edge {
    node: Node!
    cursor: String!
  }

  """
  GraphQL Connection spec. interface
  """
  interface Connection {
    totalCount: Int!
    pageInfo: PageInfo!
    edges: [Edge]!
  }

  input BetweenDate {
    start: Date!
    end: Date!
  }

  input BetweenTime {
    start: Time!
    end: Time!
  }

  input BetweenDateTime {
    start: DateTime!
    end: DateTime!
  }

  input BetweenInt {
    start: Int!
    end: Int!
  }

  input BetweenMoney {
    start: Money!
    end: Money!
  }

  """
  Money type.
  The value is stored in the smallest monetary unit (kopecks, cents, etc.)
  Real type - Int
  e.g. For 250 USD this record returns value as 250000 (250$ * 100¢)
  """
  scalar Money

  """
  DateTime type.
  Use JavaScript Date object for date/time fields
  Real type - String
  """
  scalar DateTime

  """
  DateTime type.
  Use JavaScript Date object for date fields
  Real type - String
  """
  scalar Date

  """
  Time type.
  Real type - String
  """
  scalar Time

  """
  URL type.
  A field whose value conforms to the standard URL format as specified in RFC3986: https://www.ietf.org/rfc/rfc3986.txt.
  Real type - String
  """
  scalar URL

  """
  Email address type.
  A field whose value conforms to the standard internet email address format as specified in RFC822: https://www.w3.org/Protocols/rfc822/.
  Real type - String
  """
  scalar EmailAddress

  """
  The JSON scalar type represents JSON values as specified by ECMA-404: http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf.
  """
  scalar JSON

  """
  The JSONObject scalar type represents JSON objects as specified by ECMA-404: http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf.
  """
  scalar JSONObject
`;

export default schema;