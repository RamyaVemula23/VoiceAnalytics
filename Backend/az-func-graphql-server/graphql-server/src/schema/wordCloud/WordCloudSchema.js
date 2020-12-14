const { GraphQLString, GraphQLObjectType, GraphQLList, GraphQLInt } = require('graphql');

const WordCloudResponse = new GraphQLObjectType({
    name: 'WordCloudResponse',
    fields: () => ({
        response: {
            type: new GraphQLList(wordCloudContent),
            resolve(resp) {
                if (resp.response === undefined) {
                    return [];
                }
            }
        }
    })
});

const wordCloudContent = new GraphQLObjectType({
    name: 'wordCloudContent',
    fields: () => ({
        
        Words: {
            type: GraphQLString 
        },
        Frequency: {
            type: GraphQLInt
        }
    })
});

module.exports = { WordCloudResponse }