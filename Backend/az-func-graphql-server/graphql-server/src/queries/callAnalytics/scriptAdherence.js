const { ScriptAdherenceResponse } = require("../../schema/scriptAdherence/scriptAdherenceSchema");
const {scriptAdherence} = require("../../resolvers/ScriptAdherenceResolver");
const { GraphQLString } = require('graphql');

const totalScriptAdherence = {
    getScriptAdherence: {
        type: ScriptAdherenceResponse,
        args: {
            startDate : { type : GraphQLString },
            endDate : { type : GraphQLString }
        },
        resolve: async (root, args, context, info) => {
            let totalResult = await scriptAdherence(args).then(results=>{
                let response = []
            results.forEach(result=>{
                response.push({
                    ID : result.ID,
                    ScriptType: result.Script_Type,
                    Score : result.Score
                })
            })
            let jsonResponse = {response};
            console.log(jsonResponse)
            return jsonResponse;
            })
            return totalResult

        }
    }
}
module.exports = { totalScriptAdherence };




