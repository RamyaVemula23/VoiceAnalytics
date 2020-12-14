import React, { Component } from 'react';
import * as d3 from 'd3';

class DonutChart extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            width: props.width,
            height: props.height,
            scale: props.scale,
            data: props.data,
            colorData: props.colorData
         }
    }

    componentDidMount() {
        let { width, height, scale, data,colorData } = this.state
        this.drawDonutChart(width, height, scale, data, colorData)
    }

    drawDonutChart = (width, height, margin, data, colorData) => {

        const radius = Math.min(width, height) / 2 - margin 
        const color  =  d3.scaleOrdinal(colorData)
    
        const svg = this.createDonutSVG(width, height)
        const pie = d3.pie().sort(null).value(function(d) {return d.value; })
        const data_ready = pie(d3.entries(data))
        const arc = this.createArc(radius, 0.5, 0.8)
        const outerArc = this.createArc(radius, 0.9, 0.9)
        
        this.createDonut(svg, data_ready, arc, color);
        this.creaetPolyLines(svg, data_ready, arc, outerArc, radius);
        const text = svg.selectAll('allLabels').data(data_ready).enter()
    
        this.writeKeys(text, outerArc, radius);
        this.writeValues(text, outerArc, radius);
        
    }
    
    createDonutSVG = (width, height) => {
        return d3.select(".DonutChart")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
                .append("g")
                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
    }
    
    createArc = (radius, innerRadiusMultiplier, outerRadiusMultiplier) => {
        return d3.arc()
            .innerRadius(radius * innerRadiusMultiplier) // This is the size of the donut hole
            .outerRadius(radius * outerRadiusMultiplier);
    }
    
    createDonut = (svg, data_ready, arc, color) => {
        svg
            .selectAll('allSlices')
            .data(data_ready)
            .enter()
            .append('path')
            .attr('d', arc)
            .attr('fill', function (d) { return (color(d.data.key)); })
    }
    
    creaetPolyLines = (svg, data_ready, arc, outerArc, radius) => {
        svg
            .selectAll('allPolylines')
            .data(data_ready)
            .enter()
            .append('polyline')
            .attr("stroke", "black")
            .style("fill", "none")
            .attr("stroke-width", 1)
            .attr('points', (d) => {
                var posA = arc.centroid(d);
                var posB = outerArc.centroid(d);
                var posC = outerArc.centroid(d);
                var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1);
                return [posA, posB, posC];
            });
    }
    
    writeKeys = (text, outerArc, radius) => {
        text.append('text')
            .text( (d) => { return d.data.key; })
            .attr('transform', (d) => {
                var pos = outerArc.centroid(d);
                var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
                console.log(pos);
                return 'translate(' + pos + ')';
            })
            .attr("font-family", "sans-serif")
            .attr("font-size", "13px")
            .style('text-anchor', (d) => {
                var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                return (midangle < Math.PI ? 'start' : 'end');
            })
    }
    
    writeValues = (text, outerArc, radius) => {
        text.append('text')
            .text(function (d) { return d.data.value; })
            .attr('transform', (d) => {
                var pos = outerArc.centroid(d);
                var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
                pos[1] = pos[1] + 20;
                return 'translate(' + pos + ')';
            })
            .attr("font-family", "sans-serif")
            .attr("font-size", "13px")
            .style('text-anchor', (d) => {
                var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                return (midangle < Math.PI ? 'start' : 'end');
            })
    }

    render() { 
        return ( <div className="DonutChart"></div> );
    }
}
 
export default DonutChart;