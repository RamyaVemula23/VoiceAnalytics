import React from 'react';
import Paper from '@material-ui/core/Paper';
import './../../css/style.css'

export default function SimpleCard(props) {
  return (
      <Paper className='summary-card' elevation={0} square>
          <p className="summary-card-heading">{props.heading}</p>
          <p className="summary-card-body">{props.value}</p>
      </Paper>
  );
}