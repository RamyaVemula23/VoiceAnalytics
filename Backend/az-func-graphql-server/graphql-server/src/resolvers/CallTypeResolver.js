const dbConnect=require("../utilities/DbConnect");

const callTypes = async function getCallTypes(args){
  let results = await dbConnect("getCallTypes", args);
    //console.log("***********************",results)
    return results;

}
module.exports = {callTypes}