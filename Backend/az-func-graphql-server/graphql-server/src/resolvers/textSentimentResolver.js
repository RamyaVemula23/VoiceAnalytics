const dbConnect=require("../utilities/DbConnect");

const textSentiment = async function gettextSentiment(args){
    results = await dbConnect("getTextSentiment", args);
    console.log("*&*&*&*&*&*", results);
    return results;

}
module.exports = {textSentiment}
 

