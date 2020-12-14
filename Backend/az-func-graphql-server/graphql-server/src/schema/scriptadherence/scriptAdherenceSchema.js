const { GraphQLString, GraphQLObjectType, GraphQLList, GraphQLInt,GraphQLFloat } = require('graphql');


const ScriptAdherenceResponse = new GraphQLObjectType({
    name: 'ScriptAdherenceResponse',
    fields: () => ({
        response: {
            type: new GraphQLList(ScriptAdherenceContent),
            resolve(resp) {
                if (resp.response === undefined) {
                    return [];
                }
            }
        }
    })
});

const ScriptAdherenceContent = new GraphQLObjectType({
    name: 'ScriptAdherenceContent',
    fields: () => ({
        ID: {
            type: GraphQLInt
        },
        ScriptType: {
            type: GraphQLString
        },
        Score: {
            type: GraphQLFloat
        }
    })
});

module.exports = { ScriptAdherenceResponse }