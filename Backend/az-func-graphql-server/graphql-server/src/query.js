const {GraphQLObjectType} = require('graphql');
const {queries} = require('../src/queries');

const Query = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        ...queries
    })
});
module.exports = { Query };
