This is the Azure functions integration of GraphQL Server. Apollo Server is a community-maintained open-source GraphQL server that works with many Node.js HTTP server frameworks. [Read the docs](https://www.apollographql.com/docs/apollo-server/v2). [Read the CHANGELOG](https://github.com/apollographql/apollo-server/blob/master/CHANGELOG.md).

```shell
npm install apollo-server-azure-functions
```

## Writing azure function

Azure functions currently support two runtime versions. This package assumes that function is running under **runtime 2.0**.

Azure functions typically consist of at least 2 files - index.js (function handler definition) and function.json (function settings and bindings).
For more information about azure functions development model in general, refer to [official Azure functions docs](https://docs.microsoft.com/en-us/azure/azure-functions/functions-reference-node).

index.js:

```js
const { ApolloServer, gql } = require('apollo-server-azure-functions');
const { schema } =require('./src/schema');


function getApolloServerSchemaOpts() {
	const schemaOptions = {
		schema,
		formatError
	};

	schemaOptions.cacheControl = useCacheControl;
	schemaOptions.mockEntireSchema = false;
	return schemaOptions;
}
console.log("Here");
const server = new ApolloServer({...getApolloServerSchemaOpts(),playground:{
	settings:{
		'schema.polling.enable': false
	}
}});

exports.graphqlHandler = server.createHandler();
```
> Set 'schema.polling.enable': false to disable auto update of schema

function.json:
```json
{
  "bindings": [
    {
      "authLevel": "function",
      "type": "httpTrigger",
      "direction": "in",
      "name": "req",
      "methods": [
        "get",
        "post"
      ]
    },
    {
      "type": "http",
      "direction": "out",
      "name": "$return"
    }
  ]
}```

It is important to set output binding name to '$return' for apollo-server-azure-function to work correctly.

## Modifying the Azure Function Response (Enable CORS)

To enable CORS the response HTTP headers need to be modified. To accomplish this use the `cors` option.

```js
module.exports = server.createHandler({
  cors: {
    origin: '*',
    credentials: true,
  },
});
```

To enable CORS response for requests with credentials (cookies, http authentication) the allow origin header must equal the request origin and the allow credential header must be set to true.

### Cors Options

The options correspond to the [express cors configuration](https://github.com/expressjs/cors#configuration-options) with the following fields(all are optional):

* `origin`: boolean | string | string[]
* `methods`: string | string[]
* `allowedHeaders`: string | string[]
* `exposedHeaders`: string | string[]
* `credentials`: boolean
* `maxAge`: number
