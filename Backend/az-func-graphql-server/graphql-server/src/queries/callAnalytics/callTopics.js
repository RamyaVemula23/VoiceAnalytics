const { CallTopicsResponse } = require("../../schema/call-topics/callTopicSchema");
const { callTopics } = require('../../resolvers/CallTopicsResolver');
const { GraphQLString } = require('graphql');

const totalCallTopics = {
    getCallTopics: {
        type: CallTopicsResponse,
        args: {
            startDate : { type : GraphQLString },
            endDate : { type : GraphQLString }
        },
        resolve: async (root, args, context, info) => {
            let totalResults = await callTopics(args).then(results=>{
                let response = []
                //console.log("******************",results)
                results.forEach(result=>{
                    response.push({
                        ID : result.ID,
                        CallTopic : result.CALLTOPICS,
                        Score : result.Score
                    })
                })
                let jsonResponse = {response};
                console.log(jsonResponse);
                return jsonResponse;    

            })
            return totalResults
        }
    }
}

module.exports = { totalCallTopics };