import React, { useState } from 'react';
import DateFnsUtils from '@date-io/date-fns'; // choose your lib
import {
  DatePicker,
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';

export default function DatePickers(props) {
  const propDate = props.date
  const [selectedDate, handleDateChange] = useState(propDate.length === 0 ? new Date() : new Date(propDate));
  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <DatePicker  disableToolbar
          variant="inline"
          format="dd,MMM yyyy"
          margin="normal"
          id={props.id}
          label={props.label}
          value={selectedDate} 
          onChange={handleDateChange} />
    </MuiPickersUtilsProvider>
  );
}