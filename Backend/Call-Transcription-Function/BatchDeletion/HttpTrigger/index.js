const axios = require('axios');

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
        requestTimeout: 30000,
        rowCollectionOnRequestCompletion: true
    }
};
module.exports = async function (context, req) {
    let api_locations = await dbConnect("getApiId", "");
    console.log("AAAAAAAAPPPPPPPPPPPPIIIIIIIIIIIII", api_locations);
    let token = await getToken();
    TranscriptDeleteFromMsInternal(token, api_locations)

}





function dbConnect(procedureName, args) {
    const { Connection, Request, TYPES } = require("tedious");

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
                let request = new Request(procedureName, function (err, rowCount, rows) {
                    if (err) console.log(err);
                    if (procedureName == 'getApiId') {
                        rows.forEach(function (columns) {
                            var rowObject = {};
                            columns.forEach(function (column) {
                                rowObject[column.metadata.colName] = column.value;
                            });
                            jsonArray.push(rowObject);
                        });
                        resolve(jsonArray);
                    }

                });
                switch (procedureName) {
                    case "getApiId": break;
                    case "updateApiDeleted":
                        console.log("******************", args)
                        request.addParameter('call_id', TYPES.Int, args)
                        break;

                }
                request.on("requestCompleted", function () {
                    console.log("Processed record");
                    connection.close();
                });
                connection.callProcedure(request);
                //var results=await queryDatabase('retrieveFact').then(res);
                //console.log(results)
            }
        });
    });
};




async function getToken() {
    let config2 = {
        headers: {
            'Content-Type': process.env.ContentType,
            "Access-Control-Allow-Origin": process.env.AccessControlAllowOrigin,
            "Ocp-Apim-Subscription-Key": process.env.OcpApimSubscriptionKey
        }
    };
    data = {}

    var issueToken = await axios.post('https://' + process.env.API_LOCATION + '.api.cognitive.microsoft.com/sts/v1.0/issuetoken?scope=speechservicesmanagement', data, config2)
        .then((response) => {
            console.log("RESPONSE RECEIVED: ", response.data);
            return response.data;
        })
        .catch((err) => {
            console.log("AXIOS ERROR: ", err);

        })
    return issueToken;
}


function TranscriptDeleteFromMsInternal(issueToken, api_locations) {
    //console.log("I'm hereeeeeeeeeeeeeeeeeeeeeeeeeeeee", issueToken)

    let config1 = {
        headers: {
            "Accept": process.env.Accept,
            'Content-Type': process.env.ContentType,
            "Access-Control-Allow-Origin": process.env.AccessControlAllowOrigin,
            "Ocp-Apim-Subscription-Key": process.env.OcpApimSubscriptionKey,
            "Authorization": issueToken
        }
    };
    api_locations.forEach(async (api) => {
        transcriptionURL = "https://" + process.env.API_LOCATION + ".cris.ai/api/speechtotext/v2.0/transcriptions/" + api.Api_Id;// some commands
        var response = await axios.delete(transcriptionURL, config1).catch((err) => {
            console.log("axiosCall ERROR: ", err);

        });
        //console.log("RESPONSE RECEIVED aaaaaaaaaaaaaaaaa: ", response);
        if (response.status == 204) {
            dbConnect("updateApiDeleted", api.call_ID)
        }
    })

}
