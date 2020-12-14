import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import DonutChart from '../components/chart/DonutChart';
import Paper from '@material-ui/core/Paper';
import {colorData} from './../Data/misc'
import {CALL_TOPICS} from './../Data/graphQLData'


export default function CallTopicsCard(props) {
    let startDay = props.startDay
    let endDay = props.endDay
    // console.log("Call topics: ", startDay, endDay)
    
    const { loading, error, data } = useQuery(CALL_TOPICS(startDay, endDay))

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error : {error} </p>;

    let callTopicsRetrieved = data === undefined ? "" : data.getCallTopics.response
    // delete callTypesRetrieved.__typename
    let callTopics = {}
    
    
    for(let i = 0; i < callTopicsRetrieved.length; i++) {
        let callTopicName = callTopicsRetrieved[i].CallTopic
        callTopics[callTopicName] = callTopicsRetrieved[i].Score
    }

    return (
    <React.Fragment>
        <div className="container-padded">
        <Paper className='chart-card-type1' elevation={0} square>
            <p className="card-heading">CALL TOPICS</p>
            <center><DonutChart id = "callTOpics" height = {props.height} scale = "20" data = {callTopics} colorData = {colorData} divClass = "callTopicsDonut" /></center>
        </Paper>
        </div>
    </React.Fragment>
    )
}