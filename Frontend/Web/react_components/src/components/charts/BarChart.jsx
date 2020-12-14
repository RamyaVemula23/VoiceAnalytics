import React, { Component } from 'react';
import * as d3 from 'd3';

class BarChart extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            width:props.width,
            height:props.height,
            scale:props.scale,
            data: props.data
         }
    }

    componentDidMount() {
        let { width, height, scale, data } = this.state
        this.drawBarChart(width, height, scale, data)
    }

    drawBarChart = (width, height, scale, data) => {
    
        const yOffset = (height / data.length)
        const svg = this.createSVG(width, height)
        const rect = svg.selectAll("rect").data(data).enter()
        const text = svg.selectAll("text").data(data).enter()
    
        this.backgroundBar(rect, scale, width, yOffset);
        this.dataBarGraph(rect, scale, width, yOffset);
        this.textNameRender(text, yOffset);
        this.textPercRender(text, yOffset, width)
            
    }
    
    createSVG = (width, height) => {
        return d3.select('.BarChart').append("svg")
            .attr("width", width)
            .attr("height", height)
    }
    
    textNameRender = (text, yOffset) => {
        text.append("text")
            .attr("y", (dataPoint, i) => yOffset * i + 20)
            .attr("x", 10)
            .text((d) => d.name);
    }
    
    textPercRender = (text, yOffset, width) => {
        text.append("text")
            .attr("y", (dataPoint, i) => yOffset * i + 40)
            .attr("x", width - 35)
            .text((d) => d.percentage + "%");
    }
    
    dataBarGraph = (rect, scale, width, yOffset) => {
        rect.append("rect")
            .attr("height", scale)
            .attr("width", datapoint => datapoint.percentage * ((width - 50) / 100))
            .attr("x", 10)
            .attr("y", (datapoint, i) => yOffset * i + 25)
            .attr('fill', 'blue');
    }
    
    backgroundBar = (rect, scale, width, yOffset) => {
        rect.append("rect")
            .attr("height", scale)
            .attr("width", width - 50)
            .attr("x", 10)
            .attr("y", (datapoint, i) => yOffset * i + 25)
            .attr('fill', 'skyblue');
    }

    render() { 
        return ( 
            <div className="BarChart"></div>
         );
    }
}
 
export default BarChart;