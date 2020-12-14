const axios = require('axios');
var storage = require('azure-storage');
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
module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    var Connection = require('tedious').Connection;

    let connection = new Connection(config);

    await sqlConnection(connection);

    let config1 = {
        headers: {
            'Content-Type': process.env.ContentType,
            "Access-Control-Allow-Origin": process.env.AccessControlAllowOrigin,
            "Ocp-Apim-Subscription-Key": process.env.OcpApimSubscriptionKey
        }
    };
    data = {

    }

    var issueToken = await axios.post('https://' + process.env.API_LOCATION + '.api.cognitive.microsoft.com/sts/v1.0/issuetoken?scope=speechservicesmanagement', data, config1)
        .then((response) => {
            return response.data;
        })
        .catch((err) => {
            context.log("AXIOS ERROR: ", err);
        })
    context.log(issueToken);

    // getTranscriptsGenerated has a database call which is asynchronous. Hence we need 
    // to wait. Once the await is over the code falls back to synchronous execution
    // as such, the statements within the then block executed one after the other
    try {
        var result = await getTranscriptsGenerated(connection)
            .then((results) => {
                // context.log("********Results", results)
                if (results.length != null) {
                    let res = processResults(results)
                    context.log("********Result", res.length)
                    return res;

                } else {
                    context.log("No records with transcription_generated as 1");
                }
            });
        if (result.length != null) {
            await axiosCall(result, issueToken);
        }


    }
    catch (e) {
        context.log("ERROR in main", e)
    }
};


async function getTranscriptsGenerated(connection) {
    var jsonArr = await queryDatabase(process.env.GET_TRANSCRIPTS_SP, connection)
        .catch(err => {
            console.log("ERROR in getTranscriptsGenerated", err)

        })
    console.log("Items:::::", jsonArr.length);
    return jsonArr;
}



function processResults(recordsets) {
    try {
        newApis = [];
        recordsets.forEach(record => {
            //console.log("Here: " + record);

            var api = {
                "callId": record.call_ID,
                "location": record.api_location,
                "fileName": record.file_name
            }

            newApis.push(api);
        })

    }
    catch (e) {
        console.log("Error in processResults", e);
        newApis = [];
    }
    return newApis;

}

async function axiosCall(apis, issueToken) {
    var Connection = require('tedious').Connection,
        Request = require('tedious').Request,
        TYPES = require('tedious').TYPES;

    try {
        let config3 = {
            headers: {
                "Accept": process.env.Accept,
                'Content-Type': process.env.ContentType,
                "Access-Control-Allow-Origin": process.env.AccessControlAllowOrigin,
                "Ocp-Apim-Subscription-Key": process.env.OcpApimSubscriptionKey,
                "Authorization": issueToken
            }
        };

        apis.forEach(async (api) => {

            console.log("API to Call", api);
            await axios.get(api.location, config3).then(async (response) => {

                if (response.data.status == "Succeeded") {
                    await getTranscriptionJson(response.data.resultsUrls, api).then((res) => {
                        console.log("res:", res)
                        if (res[0] == 1) {
                            console.log("Updating records");
                            let connection = new Connection(config);
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

                                    var request = new Request(process.env.UPDATE_STATUS_SP,
                                        function (err) {
                                            if (err) {
                                                console.log(err);
                                            }

                                        });
                                    request.on('requestCompleted', function () {
                                        console.log('Processed record');
                                        connection.close();
                                    });
                                    // console.log("456789096544567898765567898765", response)
                                    var resultUrls1 = JSON.stringify(response.data.resultsUrls);

                                    transcriptsArray = []
                                    for (restUrls in response.data.resultsUrls) {
                                        var getChannel = ((restUrls.replace("c", "C")).replace("_", "."));
                                        let transcript_filename = (api.fileName).slice(0, (api.fileName).lastIndexOf(".")) + "_" + getChannel + ".json"
                                        transcriptsArray.push(transcript_filename);

                                    }
                                    transcripts_files = transcriptsArray;
                                    //console.log(transcriptsArray,"*********************************")
                                    //console.log(transcripts_files)
                                    request.addParameter('results_url', TYPES.NVarChar, resultUrls1);
                                    request.addParameter('call_ID', TYPES.Int, api.callId);
                                    request.addParameter('transcription_filenames', TYPES.NVarChar, transcripts_files)

                                    connection.callProcedure(request);

                                    //  console.log(response.data.recordingsUrl);

                                }

                            });

                            console.log("Code has moved on");
                        }
                        return res[1]

                    }).then(files => {
                        console.log("FILE7777777777777777777777777777777777777777N", files)
                        moveFromInputToProcessed(process.env.INP_CONTAINER, process.env.PROCESSED, files[0])

                    })

                }
            })
        })
    }
    catch (e) {
        console.log("Error in axiosCall", e);
    }

}


async function getTranscriptionJson(resultsUrls, api) {
    return new Promise(async (resolve, reject) => {
        try {
            for (result in resultsUrls) {
                //console.log(result + " : " + resultsUrls[result]);
                urlResult = resultsUrls[result];
                console.log(urlResult, "testing");

                var i = await AxiosForTranscription(urlResult, api);
                console.log("SUCCESS", i);
                if (i == 0) {
                    throw "Not_Succeeded"
                }
            }
            resolve([1, i]);
        }
        catch (e) {
            console.error(e);
            reject(0);
        }

    })

}

async function AxiosForTranscription(urlResult, api) {
    console.log("AxiosForTranscription");
    let wholeRes = await axios.get(urlResult)
        .then((response) => {
            var segmentResults = response.data.AudioFileResults[0].SegmentResults;
            //console.log(segmentResults);
            var segmentResultJson = {
                "callId": api.callId,
                "segmentResults": segmentResults
            }
            audioRes = response.data.AudioFileResults[0];
            var fName = (api.fileName).slice(0, (api.fileName).lastIndexOf("."));
            var audioFileName = (audioRes.AudioFileName).slice(0, (audioRes.AudioFileName).lastIndexOf("."));
            var combinedResJson = {
                "callId": api.callId,
                "AudioFileName": audioRes.AudioFileName,
                "AudioFileUrl": audioRes.AudioFileUrl,
                "AudioLengthInSeconds": audioRes.AudioLengthInSeconds,
                "CombinedResults": audioRes.CombinedResults
            }

            let fileName = fName + "_" + audioFileName + ".json";
            storingToContainers(process.env.TRANSCRIBED, combinedResJson, fileName);
            storingToContainers(process.env.TRANS_INSIGHTS, segmentResultJson, fileName);
            // moveFromInputToProcessed('input','processed',api.fileName)
            //console.log(combinedResJson);
            console.log("When and What is being sent back ", api.fileName)
            return [api.fileName, fileName];

        }).catch(error => {
            console.log(error);
            return 0;
        });
    console.log("Whole Res", wholeRes);

    return wholeRes

}


function storingToContainers(containerName, jsonData, fileName) {
    try {
        let jsonText = JSON.stringify(jsonData)
        blobService.createBlockBlobFromText(
            containerName,
            fileName,
            jsonText,
            [],
            function onResponse(error, result) {
                console.log("done")
            });

    }
    catch (e) {
        console.log("Error in storingToContainers", e);
    }


}

function moveFromInputToProcessed(containerName, outputContainer, fileName) {
    try {
        var sourceBlobUrl = blobService.getUrl(containerName, fileName);
        console.log("*****************************", sourceBlobUrl);

        blobService.startCopyBlob(sourceBlobUrl, outputContainer, fileName, function (error, result) {
            if (error)
                console.log(error);
            else
                console.log(result);
            if (result.copy.status == 'success') {

                blobService.deleteBlob(containerName, fileName, function (err) {
                    if (err) {
                        console.log(err)
                    }
                    else {
                        console.log("successfully deleted");
                    }

                })
            }

        });


    }
    catch (e) {
        console.log("Error in moveFromInputToProcessed", e)
    }


}
function queryDatabase(procedureName, connection) {
    var Request = require('tedious').Request,
        TYPES = require('tedious').TYPES;

    console.log("Reading rows from the Table...");
    return new Promise((resolve, reject) => {
        var jsonArray = [],

            // Read all rows from table
            request = new Request(
                procedureName,
                (err, rowCount, rows) => {
                    if (err) {
                        console.error(err.message);
                    }
                    rows.forEach(function (columns) {
                        var rowObject = {};
                        columns.forEach(function (column) {
                            rowObject[column.metadata.colName] = column.value;
                        });
                        jsonArray.push(rowObject)
                    });
                    //console.log(JSON.stringify(jsonArray));
                    resolve(jsonArray);
                    connection.close();

                })
        request.on('requestCompleted', function () {
            console.log('Processed record');
            connection.close();
        });
        connection.callProcedure(request);
    });


}


function sqlConnection(connection) {
    return new Promise((resolve, reject) => {
        console.log("sql");

        connection.on("connect", err => {
            if (err) {
                reject(err.message);
            } else {
                console.log("Connected");
                resolve("Connected****");

            }
        });
    })

}
