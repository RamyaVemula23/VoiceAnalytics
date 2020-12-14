const {WordCloudResponse} = require("../../schema/wordCloud/WordCloudSchema");
const {wordCloud} = require("../../resolvers/WordCloudResolver");
const { GraphQLString } = require('graphql');

const totalWordCloud = {
    getWordCloud:{
        type : WordCloudResponse,
        args: {
            startDate : { type : GraphQLString },
            endDate : { type : GraphQLString }
        },
        resolve : async (root, args, context, info) => {
            let totalResults = await wordCloud(args).then(results=>{
                let response = []
                //console.log("******************",results)
                results.forEach(result=>{
                    response.push({
                        Words : result.Words_Phrases,
                        Frequency : result.Frequency
                    })
                })
                let jsonResponse = {response};
                //console.log(jsonResponse);
                return jsonResponse;    

            })
            return totalResults
        }
    }
}

module.exports = {totalWordCloud}