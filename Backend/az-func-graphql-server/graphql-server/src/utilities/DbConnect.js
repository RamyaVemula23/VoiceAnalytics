const { Connection, Request, TYPES } = require("tedious");
const config = {
  authentication: {
    options: {
      userName: "saabadmin", // update me
      password: "p@$$w0rd" // update me
    },
    type: "default"
  },
  server: "saab-server-resource.database.windows.net", // update me
  options: {
    database: "Saab_DW_Resource", //update me
    encrypt: true,
    enableArithAbort: true,
    //connectionIsolationLevel: ISOLATION_LEVEL.READ_UNCOMMITTED,
    connectTimeout: 500000,
    rowCollectionOnRequestCompletion: true
  }
};
module.exports = function dbConnect(procedureName, args) {
  return new Promise((resolve, reject) => {
    const connection = new Connection(config);
    console.log("Here......");
 
    // Attempt to connect and execute queries if connection goes through
    connection.on("connect", err => {
      if (err) {
        console.error(err.message);
      } else {
        console.log("Connected****");
        let jsonArray = [];
        let request = new Request(procedureName, function(err, rowCount, rows) {
          if (err) console.log(err);
          rows.forEach(function(columns) {
            var rowObject = {};
            columns.forEach(function(column) {
              rowObject[column.metadata.colName] = column.value;
            });
            jsonArray.push(rowObject);
          });
          resolve(jsonArray);
        });
        request.on("requestCompleted", function() {
          console.log("Processed record");
          connection.close();
        });
        request.addParameter("startDate", TYPES.Date, args.startDate);
        request.addParameter("endDate", TYPES.Date, args.endDate);
        connection.callProcedure(request);
        //var results=await queryDatabase('retrieveFact').then(res);
        //console.log(results)
      }
    });
  });
};