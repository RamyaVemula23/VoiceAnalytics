The strongly-typed nature of a GraphQL API lends itself extremely well to [mocking]. This is an important part of a GraphQL-First development process, because it enables frontend developers to build out UI components and features without having to wait for a backend implementation.

Even with a backend that is already built, mocking allows you to test your UI without waiting on slow database requests or building out a component harness.



The mockSchema.js script returns mocked responses of the actual data present in the data warehouse.
ex: **CallTypeResponse** is a *GraphQLObjectType* object which returns mock responses to the respective queries.
    **CallTypeContent** is a *GraphQLObjectType* object which sets the fields of each object with mock data.
    
We are using **casual.js**, a fake data generator for JavaScript, so that we can get a different result every time the field is called.






[mocking]: <https://www.apollographql.com/docs/graphql-tools/mocking/>
