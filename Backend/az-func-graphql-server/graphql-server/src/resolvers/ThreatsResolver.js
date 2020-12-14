const dbConnect=require("../utilities/DbConnect");

const threats = async function getThreats(args){
    results = await dbConnect("getThreats", args);
    console.log("*&*&*&*&*&*")
     return results[0].TOTAL_THREATS;

}
module.exports = {threats}
 

