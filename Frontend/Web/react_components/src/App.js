import React from 'react';
import 'bootstrap/dist/css/bootstrap.css'
import SimplePaper from './components/material-components/SimpleCard';
import DateRangepicker from './components/DateRangePicker';
import DonutChart from './components/charts/DonutChart'
import BarChart from './components/charts/BarChart'
import LineChart from './components/charts/LineChart'
import WordCloud from './components/charts/WordCloud'

function App() {
  const barData = [
    {
      "name": "Greeting",
      "percentage": 50
    },
    {
      "name": "Feedback",
      "percentage": 40
    },
    {
      "name": "Thanking",
      "percentage": 30
    }
  ]
  
  const donutData = {Claim: 9, Enquiry: 20, Complaint:30, reservation:8}
  const colorData = ['#A9A9A9','#000000','#FFFF00','#00FF00','#00BFFF']

  const lineMargin = {top: 10, right: 30, bottom: 30, left: 60}
  const sampleData = require('./components/data/ChartData.json')
  const lineData = sampleData.dataArray

  const wordCloudData = sampleData.wordCloudArray

  return (
    <div className="container">
      <div className="row">
        <div className="col-4"><SimplePaper heading="Dhanush" value="100" /></div>
        <div className="col-8"><DateRangepicker/></div>
      </div>

      <div className="row">
        <div className="col-6"><DonutChart width = "300" height = "200" scale = "20" data = {donutData} colorData = {colorData} /></div>
        <div className="col-6"><BarChart width = "300" height = "200" scale = "20" data = {barData} /></div>
      </div>

      <div className="row">
        <div className="col-6"><LineChart width = "300" height = "200" margin = {lineMargin} data = {lineData} /></div>
      </div>
      <br />
      <div className="row">
        <WordCloud width = "1200" height = "500" data = {wordCloudData} colorData = {colorData} />
      </div>

    </div>


  );
}

export default App;
