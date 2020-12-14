import React, { Component } from 'react';
import * as d3 from 'd3';

class BarChart extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            id:props.id,
            height:props.height,
            scale:props.scale,
            data: props.data,
            nameKey: props.nameKey,
            valueKey: props.valueKey
         }
    }

    componentDidMount() {
        let { height, scale, data } = this.state
        this.drawBarChart(document.getElementById(this.state.id).offsetWidth, height, scale, data)
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
        return d3.select('.barchart').append("svg")
            .attr("width", "100%")
            .attr("height", height)
            .attr('preserveAspectRatio', 'xMinYMin meet')
            .attr('viewBox', '0 0 ' + width + ' ' + height)
    }
    
    textNameRender = (text, yOffset) => {
        let {nameKey} = this.state
        text.append("text")
            .attr("y", (dataPoint, i) => yOffset * i + 20)
            .attr("x", 10)
            .attr("font-family", "GT Walsheim Pro Bold")
            .attr("font-size", "14px")
            .text((d) => d[nameKey]);
    }
    
    textPercRender = (text, yOffset, width) => {
        let {valueKey} = this.state
        text.append("text")
            .attr("y", (dataPoint, i) => yOffset * i + 45)
            .attr("x", width - (0.2 * width))
            .attr("font-family", "GT Walsheim Pro Bold")
            .attr("font-size", "14px")
            .text((d) => d[valueKey] + "%");
    }
    
    dataBarGraph = (rect, scale, width, yOffset) => {
        let {valueKey} = this.state
        rect.append("rect")
            .attr("height", scale)
            .attr("width", datapoint => datapoint[valueKey] * ((width - (width / 4)) / 100))
            .attr("x", 10)
            .attr("y", (datapoint, i) => yOffset * i + 25)
            .attr('fill', '#00C9FF');
    }
    
    backgroundBar = (rect, scale, width, yOffset) => {
        rect.append("rect")
            .attr("height", scale)
            .attr("width", width - (width / 4))
            .attr("x", 10)
            .attr("y", (datapoint, i) => yOffset * i + 25)
            .attr('fill', '#00C9FF1A');
    }

    render() { 
        return ( 
            <div id={this.state.id} className="barchart"></div>
         );
    }
}
 
export default BarChart;