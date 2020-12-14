import React, { Component } from 'react';
import DatePickers from './material-components/DatePicker';

class DateRangepicker extends Component {
    constructor(props) {
        super(props);
        this.state = {  }
    }

    handleDateRangechange = (e) => {
        e.preventDefault()
        console.log(e.target.querySelector('#startDate').value)
        console.log(e.target.querySelector('#startDate').value)
    }

    render() { 
        return ( 
            <div>
                <form onSubmit={this.handleDateRangechange}>
                    <label htmlFor="startdate"><DatePickers id="startDate" label="Start date" date="2020-01-01T21:11:54"/></label>
                    <label htmlFor="enddate"><DatePickers id="endDate" label="End date" date=""/></label>
                </form>
            </div>
         );
    }
}
 
export default DateRangepicker;