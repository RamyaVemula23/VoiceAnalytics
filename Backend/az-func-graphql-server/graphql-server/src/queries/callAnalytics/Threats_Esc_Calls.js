const { Threats_Esc_Calls_Response } = require("../../schema/Threats_Esc_Calls/Threat_Esc_Calls");
const { escalations } = require('../../resolvers/EscalationResolver');
const { threats } = require('../../resolvers/ThreatsResolver');
const { totalCalls } = require('../../resolvers/totalCallsResolver');
const { GraphQLString } = require('graphql');


const total_Threats_Esc_Calls = {
    getThreats_Esc_Calls: {
        type: Threats_Esc_Calls_Response,
        args: {
            startDate : { type : GraphQLString },
            endDate : { type : GraphQLString }
        },
        resolve: async (root, args, context, info) => {
            // do something with the incoming parameters and then return
            let escalationsResult = await escalations(args).then(res=>res);
            let threatsResult = await threats(args).then(res=>res);
            let totalNoOfCallsResult = await totalCalls(args).then(res=>res)

            let jsonResponse = {
                response:
                {
                    NoOfEscalations: escalationsResult,
                    NoOfThreatCalls: threatsResult,
                    TotalNoOfCalls: totalNoOfCallsResult

                }

            };
            return jsonResponse;
        }
    }
}

module.exports = { total_Threats_Esc_Calls };
