const axios = require('axios');
var storage = require('azure-storage');
var sqlConfig = {
    authentication: {
        options: {
            userName: process.env.DB_USERNAME, // update me
            password: process.env.DB_PASSWORD// update me
        },
        type: process.env.DB_TYPE // update me

    },
    server: process.env.DB_SERVER, // update me
    options: {
        database: process.env.DB_NAME, //update me
        encrypt: true,
        connectTimeout: 500000,
        rowCollectionOnRequestCompletion: true
    }

};


module.exports = function (context, req) {
    context.log("JavaScript blob trigger function processed blob ");
    axios.get("http://localhost:7071/api/CallTranscription-1")
        .then((response) => {
            console.log("RESPONSEEEEEEEEEEEEE", response)
            setTimeout(function () {
                triggerCallTranscription2(false)
            }, 300000);
        })

};
function triggerCallTranscription2(flag) {
    if (!flag) {
        axios.get("http://localhost:7071/api/CallTranscription-2").then(() => {
            setTimeout(function () {
                dataProcessing()
            }, 60000);
            return;

        })
    } else {
        setTimeout(flattenJsonToTables, 20000)
    }
}

function dataProcessing() {
    var Connection = require('tedious').Connection,
        Request = require('tedious').Request,
        TYPES = require('tedious').TYPES;
    var jsonArray = []

    let connection = new Connection(sqlConfig);
    connection.on("end", () => {
        console.log("connection ended")
    });
    connection.on("error", (err) => {
        console.log("Error on the connection", err.message);
        connection.close();
    });
    connection.on("connect", err => {
        if (err) {
            console.error("Error on the connection", err.message);
            connection.close();
        } else {
            console.log("Connected");
            var request = new Request("getFileNames", function (err, rowCount, rows) {
                if (err) {
                    console.log("Error while creating request object", err);
                }
                else {
                    rows.forEach(function (columns) {
                        var rowObject = {};
                        columns.forEach(function (column) {
                            rowObject[column.metadata.colName] = column.value;
                        });
                        jsonArray.push(rowObject)
                    });
                    connection.close();
                    getBlobFromContainer(jsonArray);
                }
            });
            request.on('requestCompleted', function () {
                console.log('Processed record');
                connection.close();
            });
            connection.callProcedure(request);
        }
    });


}

async function getBlobFromContainer(jsonArray) {

    const CONNECT_STR = process.env.AzureWebJobsStorage;
    var blobService = storage.createBlobService(CONNECT_STR);

    console.log("FILENAMES IN JSON:::::", jsonArray)
    let count
    //Promise.all(
    jsonArray.forEach((record, index, array) => {

        blobService.getBlobToText(process.env.TRANS_INSIGHTS, record.transcription_filenames,
            function (err, blobContent, blob) {
                if (err) {
                    console.error(err);
                } else {
                    if (index === array.length - 1) {
                        count = 1
                    } else {
                        count = 0
                    }
                    blobContent = JSON.parse(blobContent)
                    console.log("*************************", blobContent.callId);
                    storeBlobToDB(blobContent, count)
                }
            })
    });

}

function storeBlobToDB(blobContent, count) {
    var Connection = require('tedious').Connection,
        Request = require('tedious').Request,
        TYPES = require('tedious').TYPES;
    let connection = new Connection(sqlConfig);
    connection.on("end", () => {
        console.log("connection ended")
    });
    connection.on("error", (err) => {
        console.log("Error on the connection", err.message);
        connection.close();
    });
    connection.on("connect", err => {
        if (err) {
            console.error("Error on the connection", err.message);
            connection.close();
        } else {
            console.log("Connected");
            var request = new Request("INSERT INTO Staging_Insights_JSON" +
                " (call_ID,segmented_transcribed_JSON)" +
                "VALUES" +
                " (@call_ID,@segmented_transcribed_JSON);", function (err, rowCount) {
                    if (err)
                        console.error(err);

                    console.log('rowCount: ' + rowCount);
                    connection.close();
                });

            request.addParameter('call_ID', TYPES.Int, blobContent.callId);
            request.addParameter('segmented_transcribed_JSON', TYPES.NVarChar, JSON.stringify(blobContent.segmentResults));

            request.on('requestCompleted', function () {
                console.log('Processed record');
                connection.close();
                if (count == 1)
                    triggerCallTranscription2(true)
            });
            connection.execSql(request);

        }
    })
}

function flattenJsonToTables() {
    var Connection = require('tedious').Connection,
        Request = require('tedious').Request,
        TYPES = require('tedious').TYPES;

    let connection = new Connection(sqlConfig);
    connection.on("end", () => {
        console.log("connection ended")
    });
    connection.on("error", (err) => {
        console.log("Error on the connection", err.message);
        connection.close();
    });
    connection.on("connect", err => {
        if (err) {
            console.error("Error on the connection", err.message);
            connection.close();
        } else {
            console.log("Connected");
            var request = new Request("sp_flattenjsonintotables", function (err) {
                if (err) {
                    console.log("Error while creating request object", err);
                }
                else {
                    //trigger callTranscription3
                    triggerCallTranscription3()
                }
            });
            request.on('requestCompleted', function () {
                console.log('Processed record');
                connection.close();
            });
            connection.callProcedure(request);
        }
    });


}

function triggerCallTranscription3(){
    axios.get("http://localhost:7071/api/CallTranscript-3")
}




