var express = require('express');
var router = express.Router();
const { Connection, Request } = require("tedious");

router.get('/getFactsTable', (req, res) => {
    const config = {
        authentication: {
            options: {

                userName: "saabadmin", // update me
                password: "p@$$w0rd"// update me
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

    const connection = new Connection(config);

    // Attempt to connect and execute queries if connection goes through
    connection.on("connect", err => {
        if (err) {
            console.error(err.message);
        } else {
            console.log("Connected****");
            let jsonArray = []
            let request = new Request('retrieveFact', function (err, rowCount, rows) {
                if (err)
                    console.log(err)
                rows.forEach(function (columns) {
                    var rowObject = {};
                    columns.forEach(function (column) {
                        rowObject[column.metadata.colName] = column.value;
                    });
                    jsonArray.push(rowObject)
                });
               res.send(jsonArray)
            })
            request.on('requestCompleted', function () {
                console.log('Processed record');
                connection.close();
            });
            connection.callProcedure(request)
            //var results=await queryDatabase('retrieveFact').then(res);
            //console.log(results)

        }
    });




});

module.exports = router;