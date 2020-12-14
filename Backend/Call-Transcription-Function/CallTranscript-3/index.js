const { Connection, Request } = require("tedious");
var storage = require("azure-storage");
var TYPES = require("tedious").TYPES;

const objList = [];
const config = {
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

const CONNECT_STR = process.env.AzureWebJobsStorage;


var blobService = storage.createBlobService(CONNECT_STR);
var files = [];
var blobs = [];


module.exports = function (context, req) {
    const connection = new Connection(config);
    context.log("JavaScript HTTP trigger function processed a request.");

    connection.on("connect", async err => {
        if (err) {
            context.error(err.message);
        } else {
            context.log("Connected****");
            await queryDatabase(process.env.FETCH_INSIGHTS_SP, connection)
                .then(results => {
                    // context.log(results);
                    if (results.length != null) {
                        //context.log(results);
                        results.forEach(async record => {
                            context.log("************************");
                            context.log(record.fileName);
                            context.log("************************");
                            var stat = 0,
                                temp;
                            var transcriptsArray = record.transcription_filenames.split(",");
                            for (var index in transcriptsArray) {
                                temp = await moveFromTransToProcessed(process.env.TRANS_INSIGHTS, process.env.PROCESSED, transcriptsArray[index]);
                                stat = stat + temp;
                                // context.log("*************STAT", stat);
                            }
                            // context.log(transcriptsArray.length, stat);
                            if (stat == transcriptsArray.length) {
                                context.log("UPDATING.................", transcriptsArray.length, stat);
                                updateIfMoved(record.call_ID);
                            }
                        });
                    } else {
                        context.log("No records with transcribed insights as 1");
                    }
                })
                .catch(err => {
                    context.log(err);
                });
        }
    });
    context.log("Done");
    context.res = "Done";
}

function queryDatabase(procedureName, connection) {
    console.log("Reading rows from the Table...");
    return new Promise((resolve, reject) => {
        var jsonArray = [],
            // Read all rows from table
            request = new Request(procedureName, (err, rowCount, rows) => {
                if (err) {
                    //console.log(err);
                    reject(err);
                }
                rows.forEach(function (columns) {
                    var rowObject = {};
                    columns.forEach(function (column) {
                        rowObject[column.metadata.colName] = column.value;
                    });
                    jsonArray.push(rowObject);
                });
                console.log(JSON.stringify(jsonArray));
                resolve(jsonArray);
            });
        request.on("requestCompleted", function () {
            console.log("Here Processed record");
            connection.close();
        });
        connection.callProcedure(request);
    });
}

async function moveFromTransToProcessed(containerName, outputContainer, transcriptionFileName) {
    return new Promise(async (resolve, reject) => {
        var sourceBlobUrl = await blobService.getUrl(containerName, transcriptionFileName);
        console.log(sourceBlobUrl);
        await blobService.startCopyBlob(sourceBlobUrl, outputContainer, transcriptionFileName, async (err, result) => {
            if (err) {
                console.log("Error while copying", err);
            } else {
                // console.log("66666666666666666666666666666666666666666666", result);
                if (result.copy.status == "success") {
                    await blobService.deleteBlob(containerName, transcriptionFileName, null, function (err) {
                        if (err) {
                            console.log(err);
                            reject(0);
                        } else {
                            console.log("successfully deleted");
                            resolve(1);
                        }
                    }
                    );
                } else {
                    reject(0);
                }
            }
        }
        );
    });
}

function updateIfMoved(audioFileCall_ID) {
    try {
        let connection = new Connection(config);
        connection.on("end", () => {
            console.log("connection ended");
        });
        connection.on("error", err => {
            console.log("Error on the connection", err.message);
            connection.close();
        });
        connection.on("connect", err => {
            if (err) {
                console.error("Error on the connection", err.message);
                connection.close();
            } else {
                console.log("Connected");
                var request = new Request(process.env.MOVE_INSIGHTS_SP, function (
                    err
                ) {
                    if (err) {
                        console.log("Error while creating request object", err);
                    }
                });
                request.on("requestCompleted", function () {
                    console.log("Processed record");
                    connection.close();
                });
                console.log("Calling SP");
                request.addParameter("audiofileCallID", TYPES.Int, audioFileCall_ID);
                connection.callProcedure(request);
            }
        });
    } catch (e) {
        console.log("Error in updateIfMoved ", e);
    }
}
