const { GraphQLString, GraphQLObjectType, GraphQLList, GraphQLInt } = require('graphql');


const Threats_Esc_Calls_Response = new GraphQLObjectType({
    name: 'Threats_Esc_Calls_Response',
    fields: () => ({
        response: {
            type: Threats_Esc_Calls_Content,
            resolve(resp) {
                if (resp.response === undefined) {
                    return -1;
                }
            }
        }
    })
});

const Threats_Esc_Calls_Content = new GraphQLObjectType({
    name: 'Threats_Esc_Calls_Content',
    fields: () => ({

       
        NoOfThreatCalls: {
            type: GraphQLInt
        },
        NoOfEscalations:{
            type:GraphQLInt
        },
        TotalNoOfCalls:{
            type:GraphQLInt
        }

    })
});

module.exports = { Threats_Esc_Calls_Response }