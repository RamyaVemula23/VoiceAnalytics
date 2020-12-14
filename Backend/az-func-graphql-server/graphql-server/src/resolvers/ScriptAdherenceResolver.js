const dbConnect=require("../utilities/DbConnect");

const scriptAdherence = async function getScriptAdherence(args){
    results = await dbConnect("getScriptAdherence", args);
    return results;

}
module.exports = {scriptAdherence}