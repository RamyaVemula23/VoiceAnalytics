const dbConnect=require("../utilities/DbConnect");

const escalations = async function getEscalations(args){
    results = await dbConnect("getEscalations", args);
    console.log("*&*&*&*&*&*")
     return results[0].TOTAL_ESCALATIONS;

}
module.exports = {escalations}
 

