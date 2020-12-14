const casual = require('casual');
const { MockList } = require('apollo-server-azure-functions');
const unique = require('unique-random')
let startDate = casual.integer(1, 25)
let dates = [];

const topics = ['Payments', 'Policy', 'Claim', 'Call Drop', 'Billing', '4G', 'Hello tunes'];
const types = ['Reservation', 'Complaint', 'Enquiry', 'Claim'];
const adherence = ['Greetings', 'Feedback', 'Thanking'];
let index;
let index1;
let index2;
let index3;
let ind, numOfPoints = 100, count=0,count1=0,count2=0;
let numOfCallTypes,numOfCallTopics,callTopicsScore = [],callTypesScore=[]

while (count<numOfPoints) {
    let date = new Date();
    date.setFullYear(2020, 09, casual.integer(startDate, startDate + 6));
    date.setHours(casual.integer(0, 23), casual.integer(0, 59), casual.integer(0, 59), casual.integer(0, 999))
    dates.push(date);
    count++;
}

dates.sort((a,b)=> a-b);
//console.log(dates);
count=0;

const word = [
    "Business",
    "Banking",
    "Help",
    "Motivation",
    "Inspiration",
    "Service",
    "Technology"
];
let timestamp1, timestamp2
let mockWord

const mocks = {
    // Query:()=>({
    //     kpis :()=> new MockList([1,5])

    // }),
    CallTypeResponse: () => ({
        response: () => {
            let per = 100
            callTypesScore = []
            count1 = 0
            numOfCallTypes = casual.integer(2, 4);
            console.log("numOfCallTypes************",numOfCallTypes)
            for (i = 0; i < numOfCallTypes; i++) {
                if (i == (numOfCallTypes - 1))
                    callTypesScore.push(per)
                else {
                    let num = randomGenerator(per);
                    console.log("***", num);
                    callTypesScore.push(num);
                    per = per - num;
                }
            }
            console.log("List:", callTypesScore)
            return new MockList(numOfCallTypes)
        }

    }),
    CallTopicsResponse: () => ({
        response: () => {
            let per = 100
            callTopicsScore = []
            count2 = 0
            numOfCallTopics = casual.integer(2, 7);
            for (i = 0; i < numOfCallTopics; i++) {
                if (i == (numOfCallTopics - 1))
                    callTopicsScore.push(per)
                else {
                    let num = randomGenerator(per);
                    console.log("***", num);
                    callTopicsScore.push(num);
                    per = per - num;
                }
            }
            console.log("List:", callTopicsScore)

            return new MockList(numOfCallTopics)


        }
    }),
    ScriptAdherenceResponse: () => ({
        response: () => new MockList([2, 3])
    }),
    TextSentimentsResponse: () => ({
        response: () => new MockList(numOfPoints)
    }),
    WordCloudResponse: () => ({
        response: () => new MockList(7)

    }),


    CallTypeContent: () => ({
        ID: () => {
            index = casual.integer(1, 4);
            return index+casual.integer(1,50);
        },
        CallType: () => {
            timestamp1 = new Date().getUTCMilliseconds() + casual.integer(0, 200);
            return types[index - 1] + timestamp1
        },
        Score: () => {
            console.log("COUNNNNNNTTTTTTTT11111111",count1,callTypesScore[count1])
            count1 = count1+1
            return callTypesScore[count1-1]
        }

    }),
    CallTopicsContent: () => ({
        ID: () => {
            index1 = casual.integer(1, 7);
            return index1;
        },
        CallTopic: () => {
            timestamp1 = new Date().getUTCMilliseconds() + casual.integer(0, 200);
            return topics[index1 - 1] + timestamp1
        },
        Score: () => {
            return callTopicsScore[count2++]
        }
    }),
    TextSentimentsContent: () => ({
        callTypeId: () => {
            index3 = casual.integer(1, types.length);
            return index3;
        },
        callType: () => {
            return types[index3 - 1]
        },
        sentimentScore: () => casual.double(0.00, 100.00).toFixed(3),
        dateTime: () => {
            if(count == 100) {
                count = 0;
            }
            return dates[count++].toISOString();
        }
    }),
    KPI: () => ({
        getSentimentScores: () => new MockList(numOfPoints),
        getWordCloud: () => new MockList(7),
        callTopics: () => new MockList([2, 7])  // To get multiple records
    }),
    Threats_Esc_Calls_Content: () => ({
        NoOfThreatCalls: () => casual.integer(0, 200),
        NoOfEscalations: () => casual.integer(0, 200),
        TotalNoOfCalls: () => casual.integer(0, 400)
    }),
    wordCloudContent: () => ({

        Words: () => {
           let Windex = unique(0, 6)
            ind = Windex()
            timestamp2 = new Date().getUTCMilliseconds();
            mockWord = word[ind] + timestamp2
            console.log("==========", ind)
            return mockWord

        },
        Frequency: () => {
            console.log("&&&&&&&&&&&&", timestamp2)
            return timestamp2 % 100
        }

    }),
    ScriptAdherenceContent: () => ({
        ID: () => {
            index2 = casual.integer(1, 3);
            return index2;
        },
        ScriptType: () => {
            timestamp1 = new Date().getUTCMilliseconds() + casual.integer(0, 200);
            return adherence[index2 - 1] + timestamp1
        },
        Score: () => casual.integer(1, 100)
    })


}
function randomGenerator(perc) {
    console.log("PPPPPPPP", perc)
    if (perc == 0)
        return 0
    else {
        let rN = casual.integer(1, perc)
        console.log("RN:", rN);
        return rN;

    }


}


module.exports = { mocks }