import React, { Component } from 'react';
import logo from './../../logo/calendar_icon.png'
import DateRangeModal from './DateRangeModal';
import './calendar.css';

class DateRangePicker extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      calenderDisp: false,
      startDate: "",
      endDate: ""
     }
  }

  componentDidMount() {
    let tempDate = new Date()
    let endDate = this.replaceTime(tempDate.toUTCString()) 

    let startDate = tempDate
    startDate.setFullYear(startDate.getFullYear() - 1)
    startDate = this.replaceTime(startDate.toUTCString())

    this.setState({
      startDate:startDate,
      endDate:endDate
    })
  }

  replaceTime = (date) => {
    return date.replace( /(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)/ , "").replace("GMT", "")
  } 

  handleRangePicker = () => {
    this.setState({
      calenderDisp: !this.state.calenderDisp
    })
  }

  onSetDateRange = (e, startDay, endDay) => {
    startDay = startDay.split("/")
    endDay = endDay.split("/")

    let startDate = new Date(startDay[2], parseInt(startDay[1]) - 1, parseInt(startDay[0]) + 1)
    let endDate = new Date(endDay[2],  parseInt(endDay[1]) - 1, parseInt(endDay[0]) + 1)

    this.setState({
      startDate: this.replaceTime(startDate.toUTCString()), 
      endDate: this.replaceTime(endDate.toUTCString()),
      calenderDisp: false
    })
    this.props.onSetDateRange && this.props.onSetDateRange(e, startDay, endDay)
  }

  onCancel = () => {
    this.setState({
      calenderDisp: false
    })
  }

  render() { 
    let {startDate, endDate} = this.state
    return ( 
    <div>
      <div style={{height:10}}></div>
      <div >
        <div className="col-12 date">
          { startDate + " - " + endDate}
          <button className="border-0" onClick={this.handleRangePicker} ><img src={logo} style={{width:"30px",height:"30px"}} alt="website-logo"/></button>
        </div>
        <DateRangeModal 
          ref={this.setWrapperRef} 
          display={this.state.calenderDisp} 
          onSetDateRange={(e, startDay, endDay) => this.onSetDateRange(e, startDay, endDay)}
          onCancel={(e) => this.onCancel()} />
      </div>
    </div>
     );
  }
}
 
export default DateRangePicker;

