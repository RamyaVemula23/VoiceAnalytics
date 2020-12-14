import React from 'react';
import WordCloud from './../components/chart/WordCloud';
import { useQuery } from '@apollo/react-hooks';
import Paper from '@material-ui/core/Paper';
import {WORD_CLOUD} from './../Data/graphQLData'

export default function WordCloudCard(props) {
    let startDay = props.startDay
    let endDay = props.endDay

    // console.log("Word cloud: ", startDay, endDay)

    const { loading, error, data } = useQuery(WORD_CLOUD(startDay, endDay))
    const colorData = ['#A9A9A9','#000000','#4BBF00','#00FF00','#00BFFF']

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error : {error} </p>;

    let wordCloudRet = data === undefined ? "" : data.getWordCloud.response
    let wordCloudData = []
    for(let i = 0; i < wordCloudRet.length; i++){
        let tempObj = {
            word : wordCloudRet[i].Words,
            frequency : wordCloudRet[i].Frequency
        }

        wordCloudData = [...wordCloudData, tempObj]
    }

    return (
    <React.Fragment>
        <div className="container-padded">
        <Paper elevation={0} square>
            <div className="container-padded">
                <WordCloud id="wordcloud" height="645" data = {wordCloudData} colorData={colorData} />
            </div>
        </Paper>
        </div>
    </React.Fragment>
    )
}