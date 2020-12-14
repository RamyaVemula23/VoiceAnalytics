const { GraphQLSchema } = require('graphql');
const { Query } = require('./query');
const { Mutation } = require('./mutation');
const { mocks } = require('../mocks/mockSchema')
const { addMockFunctionsToSchema } = require('graphql-tools');

const env = process.env.GRAPHQLENV;
const schema = new GraphQLSchema({
    query: Query
    //,
    //mutation: Mutation
});
/* Uncomment this code to use custom mocks instead of resolvers
const shouldPreserveResolvers = process.env.PRESERVERESOLVER || false;
addMockFunctionsToSchema({
    schema,
    mocks: { ...mocks },
    preserveResolvers: shouldPreserveResolvers
});
*/

module.exports = { schema };
