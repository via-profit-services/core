import { HTTPListender } from '@via-profit-services/core';

type GraphiQL = (props: {
  endpoint: string;
  query: string;
  variables: Record<string, any>;
}) => HTTPListender;

const graphiql: GraphiQL = props => (_req, res) => {
  const { query, variables, endpoint } = props;

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.end(`<!--
  *  Copyright (c) 2021 GraphQL Contributors
  *  All rights reserved.
  *  https://github.com/graphql/graphiql
  *
  *  This source code is licensed under the license found in the
  *  LICENSE file in the root directory of this source tree.
  -->
  <!DOCTYPE html>
  <html>
   <head>
     <style>
       body {
         height: 100%;
         margin: 0;
         width: 100%;
         overflow: hidden;
       }
  
       #graphiql {
         height: 100vh;
       }
     </style>
     <script crossorigin src="https://unpkg.com/react@16/umd/react.development.js"></script>
     <script crossorigin src="https://unpkg.com/react-dom@16/umd/react-dom.development.js"></script>
     <link rel="stylesheet" href="https://unpkg.com/graphiql/graphiql.min.css" />
   </head>
  
   <body>
     <div id="graphiql">Loading...</div>
     <script src="https://unpkg.com/graphiql/graphiql.min.js" type="application/javascript"></script>
     <script>
       function graphQLFetcher(graphQLParams, opts = {headers: {}}) {
         return fetch(
           '${endpoint}',
           {
             method: 'POST',
             headers: {
               Accept: 'application/json',
               'Content-Type': 'application/json',
               ...opts.headers,
             },
             body: JSON.stringify(graphQLParams),
             credentials: 'omit',
           },
         ).then(response => {
           return response.json().catch(function () {
             return response.text();
           });
         });
       }
  
       ReactDOM.render(
         React.createElement(GraphiQL, {
           fetcher: graphQLFetcher,
           headerEditorEnabled: true,
           headerEditorActive: true,
           shouldPersistHeaders: true,
           docExplorerOpen: true,
           defaultVariableEditorOpen: true,
           query: \`${query}\`,
           variables: \`${JSON.stringify(variables)}\`,
         }),
         document.getElementById('graphiql'),
       );
     </script>
   </body>
  </html>`);
};

export default graphiql;
