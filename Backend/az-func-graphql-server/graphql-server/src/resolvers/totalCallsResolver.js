
const dbConnect=require("../utilities/DbConnect");

const totalCalls = async function getTotalCalls(args){
    results = await dbConnect("getCalls", args);
    console.log("*&*&*&*&*&*")
     return results[0].TOTAL_CALLS;

}
module.exports = {totalCalls}
 

