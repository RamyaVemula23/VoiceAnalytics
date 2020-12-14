#### schema.js
The schema.js file contains schema for *root query* and also contains the code to enable or disable mocks.
```js
const shouldPreserveResolvers = process.env.PRESERVERESOLVER || false;
addMockFunctionsToSchema({
    schema,
    mocks: { ...mocks },
    preserveResolvers: shouldPreserveResolvers
});
```
Uncommenting this piece of code will enable custom mocks throughout all the queries.

#### query.js
The *query.js* contains the definition of Root Query.

#### mutation.js
The *mutation.js* contains the mutations. Currently there are no mutations in the codebase.