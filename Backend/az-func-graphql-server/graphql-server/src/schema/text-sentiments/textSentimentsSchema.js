const { GraphQLString, GraphQLObjectType, GraphQLList, GraphQLInt,GraphQLFloat } = require('graphql');
const {CallTypeContent}  =require('../../schema/calltype/callTypeSchema');
console.log(CallTypeContent)

const TextSentimentsResponse = new GraphQLObjectType({
    name: 'TextSentimentsResponse',
    fields: () => ({
        response: {
            type: new GraphQLList(TextSentimentsContent),
            resolve(resp) {
                if (resp.response === undefined) {
                    return [];
                }
            }
        }
    })
});

const TextSentimentsContent = new GraphQLObjectType({
    name: 'TextSentimentsContent',
    fields: () => ({
        callTypeId:{
            type:GraphQLInt
        },

        callType: {
            type: GraphQLString
        },
        sentimentScore: {
            type: GraphQLFloat
        },
        dateTime:{
            type: GraphQLString
        }
    })
});



module.exports = { TextSentimentsResponse }