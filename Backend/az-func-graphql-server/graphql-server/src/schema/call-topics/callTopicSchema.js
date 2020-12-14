const { GraphQLString, GraphQLObjectType, GraphQLList, GraphQLInt,GraphQLFloat } = require('graphql');

const CallTopicsResponse = new GraphQLObjectType({
    name: 'CallTopicsResponse',
    fields: () => ({
        response: {
            type: new GraphQLList(CallTopicsContent),
            resolve(resp) {
                if (resp.response === undefined) {
                    return [];
                }
            }
        }
    })
});

const CallTopicsContent = new GraphQLObjectType({
    name: 'CallTopicsContent',
    fields: () => ({

        ID: {
            type: GraphQLInt
        },
        CallTopic: {
            type: GraphQLString
        },
        Score:{
            type:GraphQLFloat
        }
    })
});

module.exports = { CallTopicsResponse }