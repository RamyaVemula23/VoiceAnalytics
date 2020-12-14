import React, { Component } from 'react';
import * as d3 from 'd3';

class DonutChart extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            id: props.id,
            height: props.height,
            scale: props.scale,
            data: props.data,
            colorData: props.colorData,
            divClass: props.divClass
         }
    }

    componentDidMount() {
        let { height, scale, data, colorData, divClass } = this.state
        this.drawDonutChart(document.getElementById(this.state.id).offsetWidth, height, scale, data, colorData, divClass)
    }

    drawDonutChart = (width, height, margin, data, colorData, divClass) => {

        const radius = Math.min(width, height) / 2 - margin 
        const color  =  d3.scaleOrdinal(colorData)
    
        const svg = this.createDonutSVG(width, height, divClass)
        const pie = d3.pie().sort(null).value(function(d) {return d.value; })
        const data_ready = pie(d3.entries(data))
        const arc = this.createArc(radius, 0.4, 0.8)
        const outerArc = this.createArc(radius, 0.8, 0.8)
        this.createDonut(svg, data_ready, arc, color);
        this.createPolyLines(svg, data_ready, arc, outerArc, radius);
        const text = svg.selectAll('allLabels').data(data_ready).enter()
    
        this.writeKeys(text, outerArc, radius);
        this.writeValues(text, outerArc, radius);
        
    }
    
    createDonutSVG = (width, height, divClass) => {
        return d3.select(`.${divClass}`)
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
            .attr('fill', function (d) {return (color(d.data.key)); })
    }
    
    createPolyLines = (svg, data_ready, arc, outerArc, radius) => {
        svg
            .selectAll('allPolylines')
            .data(data_ready)
            .enter()
            .append('polyline')
            .attr("stroke", "black")
            .style("fill", "none")
            .attr("stroke-width", 0.5)
            .attr('points', (d) => {
                var posA = outerArc.centroid(d);
                var posB = outerArc.centroid(d);
                var posC = outerArc.centroid(d);
                var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                posC[0] = radius * 0.9 * (midangle < Math.PI ? 1 : -1);
                
                return [posA, posB, posC];
            });
    }
    
    writeKeys = (text, outerArc, radius) => {
        text.append('text')
            // .text( (d) => { return d.data.key; })
            .attr('transform', (d) => {
                var pos = outerArc.centroid(d);
                var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
                pos[1] = pos[1] + 1 ;
                return 'translate(' + pos + ')';
            })
            .attr("font-family", "GT Walsheim Pro Regular")
            .attr("font-size", "12px")
            .attr("font-weight", "bold")
            .style('text-anchor', (d) => {
                var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                return (midangle < Math.PI ? 'start' : 'end');
            })
            //word wrapping
            .each(function(d){
                var arr = d.data.key.split(" ");
                if (arr !== undefined) {
                    for (var i = 0; i < arr.length; i++) {
                        d3.select(this).append("tspan")
                            .text(arr[i])
                            .attr("dy", i ? "0.9rem" : 0)
                            .attr("x", 0)
                            .attr("text-anchor", "left")
                            .attr("class", "tspan" + i);
                    }
                }
            })
            
    }
    
    writeValues = (text, outerArc, radius) => {
        text.append('text')
            .text(function (d) { return (d.data.value + "%"); })
            .attr('transform', (d) => {
                var pos = outerArc.centroid(d);
                var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
                pos[1] = pos[1] + 45;
                return 'translate(' + pos + ')';
            })
            .attr("font-family", "GT Walsheim Pro Bold")
            .attr("font-size", "15px")
            
            .style('text-anchor', (d) => {
                var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                return (midangle < Math.PI ? 'start' : 'end');
            })
           
    }

    render() { 
        return ( <div id={this.state.id} className={this.state.divClass}></div> );
    }
}
 
export default DonutChart;



