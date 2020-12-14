import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import DonutChart from './../components/chart/DonutChart';
import Paper from '@material-ui/core/Paper';
import {colorData} from './../Data/misc'
import {CALL_TYPES} from './../Data/graphQLData'

export default function CallTypesCard(props) {
    let startDay = props.startDay
    let endDay = props.endDay
    // console.log("Call types: ", startDay, endDay)


    const { loading, error, data } = useQuery(CALL_TYPES(startDay, endDay))

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error : {error} </p>;

    let callTypesRetrieved = data === undefined ? "" : data.getCallTypes.response
    //delete callTypesRetrieved.__typename

    let callTypes = {}
        
    for(let i = 0; i < callTypesRetrieved.length; i++) {
        let callTypeName = callTypesRetrieved[i].CallType
        callTypes[callTypeName] = callTypesRetrieved[i].Score
    }

    return (
    <React.Fragment>
        <div className="container-padded">
        <Paper className='chart-card-type1' elevation={0} square>
            <p className="card-heading">CALL TYPES</p>
            <center><DonutChart id = "mydiv" height = {props.height} scale = "20" data = {callTypes} colorData = {colorData} divClass="callTypesDonut" /></center>
        </Paper>
        </div>
    </React.Fragment>
    )
}