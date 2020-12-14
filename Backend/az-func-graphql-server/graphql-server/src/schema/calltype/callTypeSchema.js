const { GraphQLString, GraphQLObjectType, GraphQLList, GraphQLInt,GraphQLFloat } = require('graphql');

const CallTypeResponse = new GraphQLObjectType({
    name: 'CallTypeResponse',
    fields: () => ({
        response: {
            type: new GraphQLList(CallTypeContent),
            resolve(resp) {
                if (resp.response === undefined) {
                    return [];
                }
            }
        }
    })
});

const CallTypeContent = new GraphQLObjectType({
    name: 'CallTypeContent',
    fields: () => ({

       ID:{
           type:GraphQLInt
       },
       CallType:{
           type:GraphQLString
       },
       Score:{
           type:GraphQLFloat
       }
    })
});

module.exports = { CallTypeResponse }