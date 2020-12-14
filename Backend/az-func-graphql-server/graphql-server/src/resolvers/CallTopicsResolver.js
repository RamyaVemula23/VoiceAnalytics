const dbConnect=require("../utilities/DbConnect");

const callTopics = async function getCallTopics(args){
    results = await dbConnect("getCallTopics", args);
    // console.log("*&*&*&*&*&*TOPICS", results);
    return results;

}
module.exports = {callTopics}
 

