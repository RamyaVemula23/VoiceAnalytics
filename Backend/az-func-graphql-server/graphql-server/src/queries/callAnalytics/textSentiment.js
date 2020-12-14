const { TextSentimentsResponse } = require("../../schema/text-sentiments/textSentimentsSchema");
const { textSentiment } = require("../../resolvers/textSentimentResolver");
const { callTypes } = require('../../resolvers/CallTypeResolver');
const { GraphQLString } = require('graphql');

const totalTextSentiment = {
    getTextSentiment: {
        type: TextSentimentsResponse,
        args: {
            startDate : { type : GraphQLString },
            endDate : { type : GraphQLString }
        },
        resolve: async (root, args, context, info) => {
            // do something with the incoming parameters and then return
            // let callTypesResults = await callTypes
            let totalSentimentResults = await textSentiment(args).then(results => {
                let response = []
                console.log("*****************************",results)
                results.forEach(result => {
                   let date= new Date(result.CallStartDateTime)
                   let newDate=date+""
                    response.push({
                        callTypeId:result.CALLTYPE_ID,
                        callType: result.CALLTYPE,
                        sentimentScore: result.SENTIMENT_SCORE,
                        dateTime:newDate
                        
                    })
                })
                let jsonResponse = { response };
                console.log(jsonResponse)
                return jsonResponse;

            })
            return totalSentimentResults
        }
    }
}

module.exports = { totalTextSentiment };