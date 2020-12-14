const { CallTypeResponse } = require("../../schema/calltype/callTypeSchema");
const {callTypes} = require("../../resolvers/CallTypeResolver")
const { GraphQLString } = require('graphql');

const totalCallTypes = {
    getCallTypes: {
        type: CallTypeResponse,
        args: {
            startDate : { type : GraphQLString },
            endDate : { type : GraphQLString }
        },
        resolve: async (root, args, context, info) => {
            let totalResult = await callTypes(args).then(results=>{
                //console.log("results((((((((",results)
                let response = []
                results.forEach(result=>{
                    response.push({
                        ID : result.ID,
                        CallType : result.CallType,
                        Score : result.Score
                    })
                })
              let  jsonResponse  = {response};
                console.log("JJJJJJJJSSSSSSSSSOOOOOOOONNNNNNN",jsonResponse)
                return jsonResponse;    

            })
            return totalResult
        }
    }
}

module.exports = { totalCallTypes };