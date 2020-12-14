import React, { Component } from 'react';
import './../css/style.css'
import NavBar from '../components/base-components/NavBar';
import RetrieveCards from '../graphQL/RetrieveCards';
import CallTypesCard from '../graphQL/CallTypesCard';
import CallTopicsCard from '../graphQL/CallTopicsCard';
import ScriptAdherenceCard from '../graphQL/ScriptAdherenceCard'
import SentimentScoreCard from '../graphQL/SentimentScoreCard'
import WordCloudCard from '../graphQL/WordCloudCard'
import Footer from '../components/base-components/footer';
import DateRangePicker from '../components/dateRangePicker/DateRangePicker'

class DashBoard extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            dateRange: new Date().toLocaleDateString() + " - " + new Date().toLocaleDateString(),
            filters: "",
            width:{
                callDataWidth:"440",
                cloudWidth:""
            },
            height:{
                callDataHeight:"200",
                cloudHeight:""
            },
            startDay:'',
            endDay:''
         }
    }

    componentDidMount() {
        this.updateDimensions();
        window.addEventListener("resize", this.updateDimensions.bind(this));
    }

    componentWillMount() {
        let tempDate = new Date()
        let endDate = tempDate.toLocaleDateString()
        endDate = endDate.split("/")

        let startDate = tempDate
        startDate.setFullYear(startDate.getFullYear() - 1)
        startDate = startDate.toLocaleDateString().split("/")

        this.setState({
        startDay:startDate[2] + "-" + startDate[0] + "-" + startDate[1] ,
        endDay:endDate[2] + "-" + endDate[0] + "-" + endDate[1]
        })
    }


    updateDimensions() {
        if(window.innerWidth < 768) {
          this.setState({ 
              width: {
                callDataWidth: window.innerWidth ,
                cloudWidth:""
            }
            });
        } else if(window.innerWidth > 768) {
          this.setState({ 
              width: {
                callDataWidth:"440",
                cloudWidth:""
            }
            });
        }
    }

    onSetDateRange = (e, startDate, endDate) => {
        let startDay = startDate[2] + "-" + startDate[1] + "-" + startDate[0]
        let endDay = endDate[2] + "-" + endDate[1] + "-" + endDate[0]

        this.setState({
            startDay: startDay,
            endDay: endDay
        })

    }

    render() { 
        let {height, startDay, endDay} = this.state
        return ( 
            <React.Fragment>
                <div className="topnav">
                    <NavBar nav_1 = "nav-link active" nav_2 = "nav-link line" />
                     </div> 
                <div className="custom-container">

                    <div className="row">
                        <div className="col-12 date-string"><DateRangePicker onSetDateRange={(e, startDate, endDate)=> this.onSetDateRange(e, startDate, endDate)} /></div>
                    </div>

                    <div className="row">
                        <RetrieveCards startDay={startDay} endDay={endDay} />
                    </div>

                    <div className="row">
                        <div className="col-12 filters-body">Filters:- {this.state.filters} </div>
                    </div>

                    <div className="row">
                        <div className="col-lg-4 col-md-12 col-sm-12 col-12"><CallTypesCard startDay={startDay} endDay={endDay} height={height.callDataHeight} /></div>
                        <div className="col-lg-4 col-md-12 col-sm-12 col-12"><CallTopicsCard startDay={startDay} endDay={endDay} height={height.callDataHeight}  /></div>
                        <div className="col-lg-4 col-md-12 col-sm-12 col-12"><ScriptAdherenceCard startDay={startDay} endDay={endDay} height={height.callDataHeight} /></div>
                    </div>

                    <div className="row">
                        <div className="col-12"><SentimentScoreCard startDay={startDay} endDay={endDay} /></div>
                    </div>
                    
                    <div className="row">
                        <div className="col-12 card-heading">KEYWORDS ON CALL</div>
                        <div className="col-12"><WordCloudCard startDay={startDay} endDay={endDay} /></div>
                    </div>

                </div>
                <Footer />
            </React.Fragment>
         );
    }
}
 
export default DashBoard;