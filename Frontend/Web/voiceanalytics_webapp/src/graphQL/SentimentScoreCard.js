import React from "react";
import { useQuery } from "@apollo/react-hooks";
import LineChart from "../components/chart/LineChart";
import Paper from "@material-ui/core/Paper";
import {lineColorData} from './../Data/misc';
import {SENTIMENT_SCORE} from './../Data/graphQLData'

export default function SentimentScoreCard(props) {
  let startDay = props.startDay
  let endDay = props.endDay

  // console.log("Sentiment score: ", startDay, endDay)

  const { loading, error, data } = useQuery(SENTIMENT_SCORE(startDay, endDay));

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error} </p>;

  let sentimentScoreRetrieved = data === undefined ? "" : data.getTextSentiment.response
  let sentimentScoreData = [];
  for (let x of sentimentScoreRetrieved) {
    let nextData = {
      callTypeName: x.callType,
      sentimentScore: x.sentimentScore,
      dateTime: new Date(x.dateTime).getTime()
    };
    sentimentScoreData = [...sentimentScoreData, nextData];
  }

  sentimentScoreData.sort((a, b) => parseFloat(a.dateTime) - parseFloat(b.dateTime))

  return (
    <React.Fragment>
      <div className='container-padded'>
        <Paper className='chart-card-type2' elevation={0} square>
          <p className='card-heading'>SENTIMENT SCORE</p>

          <div className='row'>
            
            <div className='col-12'>
              <p className='card-body'>Text based sentiment</p>
              <div className='linechart-body'>
                <LineChart
                  id='sentimentScore'
                  height='280'
                  data={sentimentScoreData}
                  colorData={lineColorData}
                  keyName='callTypeName'
                  timeline='dateTime'
                  dataValue='sentimentScore'
                  divClass='lineChart1'
                />
              </div>
            </div>

            {/* <div className='col-lg-6 col-md-12 col-sm-12'>
              <p className='card-body'>Text based sentiment</p>
              <div className='linechart-body'>
                <LineChart
                  id='sentimentScore2'
                  height='220'
                  data={sentimentScoreData}
                  colorData={lineColorData}
                  keyName='callTypeName'
                  timeline='dateTime'
                  dataValue='sentimentScore'
                  divClass='lineChart2'
                />
              </div>
            </div> */}
            
          </div>
        </Paper>
      </div>
    </React.Fragment>
  );
}
