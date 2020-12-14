import React, { Component } from 'react';
import * as d3 from 'd3';

class LineChart extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            id: props.id,
            height: props.height,
            data: props.data,
            keyName: props.keyName,
            timeline: props.timeline,
            dataValue: props.dataValue,
            divClass: props.divClass,
            colorData: props.colorData,
            margin: {top: 10, right: 30, bottom: 30, left: 60}
         }
    }

    componentDidMount() {
        let { height, margin, data, colorData } = this.state
        this.drawLineChart(document.getElementById(this.state.id).offsetWidth, height, margin, data, colorData)
    }

    drawLineChart = (width, height, margin, data, colorData) => {
        const svgWidth = width - margin.left - margin.right, svgHeight = height - margin.top - margin.bottom;
        const svg = this.createSVG(svgWidth, svgHeight, margin)
        const sumstat = this.dataGrouper(data)
        const x = this.xAxis(data, svgWidth)
        const y = this.yAxis(data, svgHeight)
        this.drawAxis(svg, svgHeight, x, y);
    
        const res = sumstat.map(function(d){ return d.key })
        const color = d3.scaleOrdinal()
            .domain(res)
            .range(colorData)
        
        this.drawLines(svg, sumstat, color, x, y, svgWidth, svgHeight);
    
    }
    
    createSVG = (svgWidth, svgHeight, margin) => {
        let { divClass } = this.state
        return d3.select(`.${divClass}`)
            .append("svg")
            .attr("width", svgWidth + margin.left + margin.right)
            .attr("height", svgHeight + margin.top + margin.bottom)
            .attr('viewBox','0 0 ' + (svgWidth + margin.left + margin.right) + ' ' + (svgHeight + margin.top + margin.bottom))
            .attr('preserveAspectRatio', 'xMinYMin')
            .append("g")
                .attr("transform","translate(" + margin.left + "," + margin.top + ")");
    }
    
    dataGrouper = (data) => {
        let {keyName} = this.state
        return d3.nest()
            .key(function(d) { return d[keyName];})
            .entries(data);
    }
    
    xAxis = (data, svgWidth) => {
        let {timeline} = this.state
        return d3.scaleTime()
            .domain(d3.extent(data, function(d) { return d[timeline]; }))
            .range([ 0, svgWidth ]);
    }
    
    yAxis = (data, svgHeight) => {
        let {dataValue} = this.state
        return d3.scaleLinear()
            .domain([0, d3.max(data, function(d) { return d[dataValue]; })])
            .range([ svgHeight - 50, 0 ]);
    }
    
    drawAxis = (svg, svgHeight, x, y) => {
        svg.append("g")
            .style("font", "10px GT Walsheim Pro Regular")
            .attr("transform", "translate(0," +( svgHeight - 50) + ")")
            .call(d3.axisBottom(x).ticks(15));
        svg.append("g")
            .call(d3.axisLeft(y));
    }
    
    drawLines = (svg, sumstat, color, x, y, svgWidth, svgHeight) => {
        let { timeline, dataValue } = this.state

        svg.selectAll(".line")
            .data(sumstat)
            .enter()
            .append("path")
            .attr("fill", "none")
            .attr("stroke", function (d) { return color(d.key); })
            .attr("stroke-width", 1.5)
            .attr("d", function (d) {
                return d3.line()
                    .x(function (d) { let date = new Date(d[timeline]); return x(date.getTime()); })
                    .y(function (d) { return y(d[dataValue]); })(d.values);
            });

        svg.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "end")
            .attr("x", svgWidth / 2 + 10)
            .attr("y", svgHeight- 20)
            .attr("font-family", "GT Walsheim Pro Regular")
            .attr("font-size", "12px")
            .text("Time");

        svg.append("text")
            .attr("class", "y label")
            // .attr("text-anchor", "end")
            .attr("x", -(svgHeight / 2))
            .attr("y", 0)
            .attr("dy", -28)
            .attr("transform", "rotate(-90)")
            .attr("font-family","GT Walsheim Pro Regular")
            .attr("font-size", "12px")
            .text("Score (%)");

        let nodeWidth = (d) => d.getBBox().width;

        const legend = svg.append('g')
          .attr('class', 'legend')
          .attr('transform', 'translate(0,0)');

        const lg = legend.selectAll('g')
            .data(sumstat)
            .enter()
            .append('g')
            .attr('transform', (d,i) => `translate(${i * 100},${svgHeight + 15})`);

        lg.append('rect')
          .style('fill',  function (d) { return color(d.key); })
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', 10)
          .attr('height', 10);

        lg.append('text')
          .style("font", "10px GT Walsheim Pro Regular")
          .style('font-size', '14px')
          .attr('x', 17.5)
          .attr('y', 10)
          .text(d => d.key);

        let offset = 0;
        lg.attr('transform', function(d, i) {
            let x = offset;
            offset += nodeWidth(this) + 10;
            return `translate(${x},${svgHeight + 10})`;
        });

        legend.attr('transform', function() {
          return `translate(${(svgWidth - nodeWidth(this)) / 2},${0})`
        });
    }

    render() { 
        return ( <div id={this.state.id} className={this.state.divClass} ></div> );
    }
}
 
export default LineChart;
