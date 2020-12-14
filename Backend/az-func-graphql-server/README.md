## GraphQL.js
The JavaScript reference implementation for GraphQL, a query language for APIs created by Facebook.

npm version Build Status Coverage Status

See more complete documentation at https://graphql.org/ and https://graphql.org/graphql-js/.


### Using GraphQL.js
Install GraphQL.js from npm

With yarn:
> yarn add graphql  

or alternatively using npm:

> npm install --save graphql

GraphQL.js provides two important capabilities: building a type schema, and serving queries against that type schema.

First, build a GraphQL type schema which maps to your code base.

```
import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

var schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      hello: {
        type: GraphQLString,
        resolve() {
          return 'world';
        },
      },
    },
  }),
});
```
This defines a simple schema with one type and one field, that resolves
to a fixed value. The `resolve` function can return a value, a promise,
or an array of promises. A more complex example is included in the top
level [tests](src/__tests__) directory.

Then, serve the result of a query against that type schema.

```js
var query = '{ hello }';

graphql(schema, query).then(result => {
  // Prints
  // {
  //   data: { hello: "world" }
  // }
  console.log(result);
});
```

This runs a query fetching the one field defined. The `graphql` function will
first ensure the query is syntactically and semantically valid before executing
it, reporting errors otherwise.

```js
var query = '{ BoyHowdy }';

graphql(schema, query).then(result => {
  // Prints
  // {
  //   errors: [
  //     { message: 'Cannot query field BoyHowdy on RootQueryType',
  //       locations: [ { line: 1, column: 3 } ] }
  //   ]
  // }
  console.log(result);
});
```
