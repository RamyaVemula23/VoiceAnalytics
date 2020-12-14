import React from 'react';
import Calendar from './Calendar';

class DateRangeModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      startDay: '',
      endDay: '',
      toggleBtn: [false, false, false, false, false, false]
     }
  }

  dateStringify(day) {
    if (day.toString().length === 1) {
      day = "0" + day;
    }
    return day;
  }

  monthStringify(calenderMonth) {
    if ((calenderMonth + 1).toString().length === 1) {
      calenderMonth = "0" + (calenderMonth + 1);
    }
    else {
      calenderMonth = (calenderMonth + 1);
    }
    return calenderMonth;
  }

  onDayClick = (e, day, calenderMonth, year) => {
    let {startDay, endDay} = this.state
    day = this.dateStringify(day);

    calenderMonth = this.monthStringify(calenderMonth);

    if(startDay === '') {
      this.setState({ startDay: day + '/' + calenderMonth + '/' + year })
    }
    if(startDay !== '' && endDay === '') {
        this.setState({ endDay: day + '/' + calenderMonth + '/' + year })
    }
    if(startDay !== '' && endDay !== '') {
        this.setState({
            startDay: day + '/' + calenderMonth + '/' + year,
            endDay:''
        })
    }
  }

  onSetDateRange = (e, startDay, endDay) => {
    this.props.onSetDateRange && this.props.onSetDateRange(e, startDay, endDay);
  }

  onCancel = (e) => {
    this.props.onCancel && this.props.onCancel(e)
  }

  handleClick = (e) =>{
    let n = parseInt(e.target.id) - 1
    let btnToggler = this.state.toggleBtn
    let today = new Date()
    let startDate, endDate = ''

    let date = today.getDate()
    let month = today.getMonth()
    let year = today.getFullYear()

    for(let i=0; i < btnToggler.length; i++) {
      btnToggler[i] = false
    }

    switch(n) {
      case 0: // Today
        endDate = (this.dateStringify(date) + '/' + this.monthStringify(month) + '/' + year)
        startDate = endDate

        this.setState({
          startDay: startDate,
          endDay: endDate
        })
        break;

      case 1: // Yesterday
        endDate = (this.dateStringify(date) + '/' + this.monthStringify(month) + '/' + year)
        
        if(date > 1) { startDate = (this.dateStringify(date - 1) + '/' + this.monthStringify(month) + '/' + year) }
        else {
          let newDate = new Date(year, month, 0).getDate()
          startDate = (this.dateStringify(newDate) + '/' + this.monthStringify(month - 1) + '/' + year)
        }

        this.setState({
          startDay: startDate,
          endDay: endDate
        })
        break;

      case 2: // Last Week
        endDate = (this.dateStringify(date) + '/' + this.monthStringify(month) + '/' + year)
        if(date > 7) { startDate = (this.dateStringify(date - 7) + '/' + this.monthStringify(month) + '/' + year) }
        else {
          let newDate = new Date(year, month, 0).getDate()
          startDate = (this.dateStringify(newDate - (7 - date)) + '/' + this.monthStringify(month - 1) + '/' + year)
        }

        this.setState({
          startDay: startDate,
          endDay: endDate
        })
        break;

      case 3: // Last Month
        endDate = (this.dateStringify(date) + '/' + this.monthStringify(month) + '/' + year)
        if(month >= 1) { startDate = (this.dateStringify(date) + '/' + this.monthStringify(month - 1) + '/' + year) }
        else {
          startDate = (this.dateStringify(date) + '/' + this.monthStringify(11) + '/' + (year - 1))
        }
        this.setState({
          startDay: startDate,
          endDay: endDate
        })
        break;

      case 4: // Last Year
        endDate = (this.dateStringify(date) + '/' + this.monthStringify(month) + '/' + year)
        startDate = (this.dateStringify(date) + '/' + this.monthStringify(month) + '/' + (year - 1))
        this.setState({
          startDay: startDate,
          endDay: endDate
        })
        break;

      case 5:
        this.setState({
          startDay: '',
          endDay: ''
        })
        break;
      default:
        break;
    }

    btnToggler[n] = !btnToggler[n]
    this.setState({
      toggleBtn: btnToggler
    })
  }
  
  render() { 
    let {startDay, endDay, toggleBtn} = this.state
    let disp = this.props.display ? "block" : "none"

    return ( 
      <div className="datePicker-body" style={{display:disp}}>
        <div className="top-row">
          <div className="row">
            <div className="col-2 small label-box">Start date</div>
            <div className="col-4 small input-box"><input className="in" value={startDay} disabled /></div>
            <div className="col-2 small label-box">End date</div>
            <div className="col-4 small input-box"><input className="in" value={endDay} disabled /></div>
          </div>
        </div>

        <div className="row">
          <div className="col-5 small calendar-body" >
          <Calendar width="170px" onDayClick={(e, day, calenderMonth, year)=> this.onDayClick(e, day, calenderMonth, year)}/>
          </div>
          <div className="col-4 small calendar-body calendar-box">
          <Calendar width="150px" month={true} onDayClick={(e, day, calenderMonth, year)=> this.onDayClick(e, day, calenderMonth, year)}/>
          </div>
          <div className="col-3 sidebar">
            <ul>
            <li><button id="1" className={toggleBtn[0] ? "sidebar-btn clicked-btn" : "sidebar-btn default-btn" } onClick={this.handleClick}>Today</button></li>
            <li><button id="2" className={toggleBtn[1] ? "sidebar-btn clicked-btn" : "sidebar-btn default-btn" } onClick={this.handleClick}>Yesterday</button></li>
            <li><button id="3" className={toggleBtn[2] ? "sidebar-btn clicked-btn" : "sidebar-btn default-btn" } onClick={this.handleClick}>Last Week</button></li>
            <li><button id="4" className={toggleBtn[3] ? "sidebar-btn clicked-btn" : "sidebar-btn default-btn" } onClick={this.handleClick}>Last Month</button></li>
            <li><button id="5" className={toggleBtn[4] ? "sidebar-btn clicked-btn" : "sidebar-btn default-btn" } onClick={this.handleClick}>Last Year</button></li>
            <li><button id="6" className={toggleBtn[5] ? "sidebar-btn clicked-btn" : "sidebar-btn default-btn" } onClick={this.handleClick}>Custom</button></li>
            </ul>
          </div>
          </div>
        
        <div className="bottom-row">
          <button className="btn-cancel" onClick={(e)=>this.onCancel(e)}>Cancel</button>
          <button className="btn-accept" onClick={(e)=>this.onSetDateRange(e, startDay, endDay)}>Accept</button>
        </div>
      </div>
     );
  }
}
 
export default DateRangeModal;