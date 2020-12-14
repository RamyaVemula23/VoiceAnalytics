import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import BarChart from '../components/chart/BarChart';
import Paper from '@material-ui/core/Paper';
import {SCRIPT_ADHERENCE} from './../Data/graphQLData'


export default function ScriptAdherenceCard(props) {
    let startDay = props.startDay
    let endDay = props.endDay
    // console.log("Script adherence: ", startDay, endDay)


    const { loading, error, data } = useQuery(SCRIPT_ADHERENCE(startDay, endDay))

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error : {error} </p>;

    let scriptAdherenceData = data === undefined ? "" : data.getScriptAdherence.response

    return (
    <React.Fragment>

        <div className="container-padded">
        <Paper className='chart-card-type1' elevation={0} square>
            <p className="card-heading">SCRIPT ADHERENCE</p>
            <span className="bar-card-body">
              <BarChart  id = "script" height = {props.height} scale = "25" data = {scriptAdherenceData} nameKey = "ScriptType" valueKey = "Score" />
            </span>
        </Paper>
        </div>

    </React.Fragment>
    )
}