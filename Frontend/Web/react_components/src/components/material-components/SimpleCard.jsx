import React from 'react';
import Paper from '@material-ui/core/Paper';
import { Typography } from '@material-ui/core';
import './../../css/styles.css'

export default function SimplePaper(props) {
  return (
      <Paper className='summary-card' elevation={0} square>
        <Typography variant="h6" gutterBottom>
          <p className="font">{props.heading}</p>
        </Typography>
        <Typography variant="h4" gutterBottom>
          <p>{props.value}</p>
        </Typography>
      </Paper>
  );
}