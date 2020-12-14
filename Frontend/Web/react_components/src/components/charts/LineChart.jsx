import React, { Component } from 'react';
import * as d3 from 'd3';

class LineChart extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            width: props.width,
            height: props.height,
            margin: props.margin,
            data: props.data
         }
    }

    componentDidMount() {
        let { width, height, margin, data } = this.state
        this.drawLineChart(width, height, margin, data)
    }

    drawLineChart = (width, height, margin, data) => {
        const svgWidth = width - margin.left - margin.right, svgHeight = width - margin.top - margin.bottom;
        const svg = this.createSVG(svgWidth, svgHeight, margin)
        const sumstat = this.dataGrouper(data)
        const x = this.xAxis(data, svgWidth)
        const y = this.yAxis(data, svgHeight)
    
        this.drawAxis(svg, svgHeight, x, y);
    
        const res = sumstat.map(function(d){ return d.key })
        const color = d3.scaleOrdinal()
            .domain(res)
            .range(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628','#f781bf','#999999'])
        
        this.drawLines(svg, sumstat, color, x, y);
    
    }
    
    createSVG = (svgWidth, svgHeight, margin) => {
        return d3.select('.LineChart')
            .append("svg")
            .attr("width", svgWidth + margin.left + margin.right)
            .attr("height", svgHeight + margin.top + margin.bottom)
            .append("g")
                .attr("transform","translate(" + margin.left + "," + margin.top + ")");
    }
    
    dataGrouper = (data) => {
        return d3.nest()
            .key(function(d) { return d.name;})
            .entries(data);
    }
    
    xAxis = (data, svgWidth) => {
        return d3.scaleLinear()
            .domain(d3.extent(data, function(d) { return d.year; }))
            .range([ 0, svgWidth ]);
    }
    
    yAxis = (data, svgHeight) => {
        return d3.scaleLinear()
            .domain([0, d3.max(data, function(d) { return +d.n; })])
            .range([ svgHeight, 0 ]);
    }
    
    drawAxis = (svg, svgHeight, x, y) => {
        svg.append("g")
            .attr("transform", "translate(0," + svgHeight + ")")
            .call(d3.axisBottom(x).ticks(5));
        svg.append("g")
            .call(d3.axisLeft(y));
    }
    
    drawLines = (svg, sumstat, color, x, y) => {
        svg.selectAll(".line")
            .data(sumstat)
            .enter()
            .append("path")
            .attr("fill", "none")
            .attr("stroke", function (d) { return color(d.key); })
            .attr("stroke-width", 1.5)
            .attr("d", function (d) {
                return d3.line()
                    .x(function (d) { return x(d.year); })
                    .y(function (d) { return y(+d.n); })(d.values);
            });
    }

    render() { 
        return ( <div className="LineChart"></div> );
    }
}
 
export default LineChart;
