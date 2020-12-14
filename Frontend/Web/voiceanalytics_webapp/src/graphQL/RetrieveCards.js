import React from 'react';
import SimpleCard from '../components/material/SimpleCard'
import { useQuery } from '@apollo/react-hooks';
import {KPI_RETRIEVES} from './../Data/graphQLData'

export default function RetrieveCards(props) {
  let startDay = props.startDay
    let endDay = props.endDay
    // console.log("Call retrieves: ", startDay, endDay)

  const { loading, error, data } = useQuery(KPI_RETRIEVES(startDay, endDay));

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error} </p>;

  let retrieves = data === undefined ? "" : data.getThreats_Esc_Calls.response

  return (
    <React.Fragment>
        <div className="container-padded-summary col-lg-3 col-md-6 col-sm-6 col-12"><SimpleCard heading="No. of Calls" value={retrieves.TotalNoOfCalls} /></div>
        <div className="container-padded-summary col-lg-3 col-md-6 col-sm-6 col-12"><SimpleCard heading="No. of Escalations" value={retrieves.NoOfEscalations} /></div>
        <div className="container-padded-summary col-lg-3 col-md-6 col-sm-6 col-12"><SimpleCard heading="No. of Threat Calls" value={retrieves.NoOfThreatCalls} /></div>
        <div className="container-padded-summary col-lg-3 col-md-6 col-sm-6 col-12"><SimpleCard heading="AHT" value="200s" /></div>
    </React.Fragment>
  )
}