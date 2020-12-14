var storage = require('azure-storage');
const axios = require('axios');
var rn = require('random-number');
var rnoptions = {
    min: 1000,
    max: 2147483645,
    integer: true// example input
}

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
        connectTimeout: 500000
    }
};


// The storage connection string should be picked from the app settings file.


module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    let config = {
        headers: {
            'Content-Type': process.env.ContentType,
            "Access-Control-Allow-Origin": process.env.AccessControlAllowOrigin,
            "Ocp-Apim-Subscription-Key": process.env.OcpApimSubscriptionKey
        }
    };
    data = {}

    var issueToken = await axios.post('https://' + process.env.API_LOCATION + '.api.cognitive.microsoft.com/sts/v1.0/issuetoken?scope=speechservicesmanagement', data, config)
        .then((response) => {
            context.log("RESPONSE RECEIVED: ", response.data);
            return response.data;
        })
        .catch((err) => {
            context.log("AXIOS ERROR: ", err);

        })

    const CONNECT_STR = process.env.AzureWebJobsStorage;
    var blobService = storage.createBlobService(CONNECT_STR);
    var files = [];
    var blobs = [];
    try {
        var blobResult = await processBlobs(blobService, blobs);
        if (blobResult.length != null) {

            //console.log(blobResult);
            var result = await getSAS(blobResult, blobService, files)
            if (result.length != null) {
                await callTranscriptionApi(result, issueToken).then((result) => {
                    if (result.length != null) {
                        insertRecords(result);
                    }

                    //console.log(result)
                });

            }
        }
        else {
            context.log("There are no blobs in input container");
        }


    } catch (e) {
        context.log("Error in main", e);
    }


    // store the data in the Database/
    //console.res="Done";
};

function processBlobs(blobService, blobs) {
    return new Promise((resolve, reject) => {
        blobService.listBlobsSegmented(process.env.INP_CONTAINER, null, null, function (error, result) {
            if (error) {
                reject(error)
            }
            blobs.push.apply(blobs, result.entries);
            // console.log(blobs);
            resolve(blobs);

        });

    })

}

function getSAS(blobs, blobService, files) {
    try {
        var startDate = new Date();
        startDate.setMinutes(startDate.getMinutes() - 5);
        var expiryDate = new Date(startDate);
        expiryDate.setMinutes(startDate.getMinutes() + 60);
        permissions = storage.BlobUtilities.SharedAccessPermissions.READ;
        var sharedAccessPolicy = {
            AccessPolicy: {
                Permissions: permissions,
                Start: startDate,
                Expiry: expiryDate
            }
        }
        blobs.forEach((blob) => {
            var sharedAccessSignatureToken = blobService.generateSharedAccessSignature(process.env.INP_CONTAINER, blob.name, sharedAccessPolicy);
            //console.log(blob.name);
            var url = blobService.getUrl(process.env.INP_CONTAINER, blob.name, null, blobService.host.primaryHost);
            var uri = url + '?' + sharedAccessSignatureToken;
            //console.log(uri);

            var file = {
                "name": blob.name,
                "sas": uri
            }
            files.push(file);

        });


    }
    catch (e) {
        console.log("Error in getSAS", e);
        files = [];
    }
    return files;
}
async function callTranscriptionApi(result, issueToken) {
    let config = {
        headers: {
            "Accept": process.env.Accept,
            'Content-Type': process.env.ContentType,
            "Access-Control-Allow-Origin": process.env.AccessControlAllowOrigin,
            "Ocp-Apim-Subscription-Key": process.env.OcpApimSubscriptionKey,
            "Authorization": issueToken
        }
    };

    var retVals = await Promise.all(
        result.map(async (record) => {
            let data = {
                "recordingsUrl": record.sas,
                "locale": process.env.locale,
                "name": process.env.name,
                "properties": {
                    "AddWordLevelTimestamps": process.env.AddWordLevelTimestamps,
                    "AddDiarization": process.env.AddDiarization,
                    "AddSentiment": process.env.AddSentiment,
                    "ProfanityFilterMode": process.env.ProfanityFilterMode,
                    "PunctuationMode": process.env.PunctuationMode
                }

            }
            console.log("At 1");
            var transcript = await axiosCall(data, config);
            //console.log("**********************",transcripts);
            console.log("At 2");
            return {
                "transcript": transcript.headers,
                "file": record.name,
                "recordingUrl": transcript.config.data

            };
        })
    ).then((values) => {
        console.log("VAAAAALLLLLLUUUEEESSSSSSSSS",values)
        return values;
    }).catch((err) => {
        console.log("callTranscriptionApi ERROR: ", err);
        return [];

    });
    return retVals;
}

async function axiosCall(data, config) {
    console.log("at 1.1");
    // in config have the data stored as 'https://{somevariable}.cris.ai/api/speechtotext/v2.0/transcriptions'
    //let transcriptionURL = process.env.transcriptURL;
    // now replace the variable part in transcriptURL with the actual value

    transcriptionURL = "https://" + process.env.API_LOCATION + ".cris.ai/api/speechtotext/v2.0/transcriptions";// some commands
    var response = await axios.post(transcriptionURL, data, config).catch((err) => {
        console.log("axiosCall ERROR: ", err);

    });
    //console.log("RESPONSE RECEIVED: ", dataResponse.headers);
    return response;


}




function insertRecords(results) {
    var Connection = require('tedious').Connection,
        Request = require('tedious').Request,
        TYPES = require('tedious').TYPES;
    try {
        console.log("FFFFFFOOOOOOOOORRRR:::::::::::",results.length)
        for (let index = 0; index < results.length; index++) {
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
                    var request = new Request(process.env.INSERT_SP, function (err) {
                        if (err) {
                            console.log("Error while creating request object", err);
                        }
                    });
                    request.on('requestCompleted', function () {
                        console.log('Processed record');
                        connection.close();
                    });
                    request.addParameter('call_ID', TYPES.Int, rn(rnoptions));
                    request.addParameter('file_name', TYPES.VarChar, results[index].file);
                    request.addParameter('cache_control', TYPES.VarChar, results[index].transcript["cache-control"]);
                    request.addParameter('pragma', TYPES.VarChar, results[index].transcript.pragma);
                    request.addParameter('expires', TYPES.Int, results[index].transcript.expires);
                    request.addParameter('api_location', TYPES.VarChar, results[index].transcript.location);
                    request.addParameter('retry_after', TYPES.Int, results[index].transcript["retry-after"]);
                    request.addParameter('api_server', TYPES.VarChar, results[index].transcript.server);
                    request.addParameter('operation_location', TYPES.VarChar, results[index].transcript["operation-location"]);
                    request.addParameter('api_supported_versions', TYPES.VarChar, results[index].transcript["api-supported-versions"]);
                    request.addParameter('x_ratelimit_limit', TYPES.Int, results[index].transcript["x-ratelimit-limit"]);
                    request.addParameter('x_ratelimit_remaining', TYPES.Int, results[index].transcript["x-ratelimit-remaining"]);
                    request.addParameter('x_ratelimit_reset', TYPES.VarChar, results[index].transcript["x-ratelimit-reset"]);
                    request.addParameter('x_powered_by', TYPES.VarChar, results[index].transcript["x-powered-by"]);
                    request.addParameter('x_content_type_options', TYPES.VarChar, results[index].transcript["x-content-type-options"]);
                    request.addParameter('x_frame_options', TYPES.VarChar, results[index].transcript["x-frame-options"]);
                    request.addParameter('strict_transport_security', TYPES.VarChar, results[index].transcript["strict-transport-security"]);
                    request.addParameter('run_date', TYPES.VarChar, results[index].transcript.date);
                    request.addParameter('connection', TYPES.VarChar, results[index].transcript.connection);
                    request.addParameter('content_length', TYPES.Int, results[index].transcript["content-length"]);
                    request.addParameter('recording_url', TYPES.NVarChar, results[index].recordingUrl);
                    request.addParameter('results_url', TYPES.NVarChar, "default")
                    connection.callProcedure(request);
                }
            });
        }

    }
    catch (e) {
        console.log("Error in insertRecords", e);
    }

}


