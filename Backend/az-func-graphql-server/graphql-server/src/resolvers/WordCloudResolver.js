const dbConnect=require("../utilities/DbConnect");

const wordCloud = async function getWordCloud(args){
    results = await dbConnect("getWordCount", args);
    // console.log("*&*&*&*&*&*Word Count", results);
    return results;

}
module.exports = {wordCloud}