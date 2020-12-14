import React, { Component } from 'react';
import * as d3 from 'd3'
import cloud from 'd3-cloud'

class WordCloud extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            height: props.height,
            data: props.data,
            colorData: props.colorData,
            id: props.id
         }
    }

    componentDidMount() {
        let {height, data, colorData} = this.state
        this.drawWordCloud(document.getElementById(this.state.id).offsetWidth, height, data, colorData)
    }

    drawWordCloud = (width, height, data, colorData) => {

      let layout = cloud()
        .size([width, height])
        .words(data.map((d) => {
          // console.log(d)
          return {text: d.word, size: 10 + (d.frequency - 0) / (100 - 0) * 60, test: "test"};
        }))
        .padding(1)
        .rotate(() => { return ~~(Math.random() * 2) * 90; })
        .font("Impact")
        .fontSize((d) => { return d.size; })
        .on("end", draw);
        
    
      layout.start();
    
      function draw(words) {
      
        const color  =  d3.scaleOrdinal(colorData)
        const svg = d3.select(".WordCloud").append("svg")
          .attr("width", "100%")
          .attr("height", layout.size()[1])
          .attr('viewBox','0 0 ' + layout.size()[0] + ' ' + layout.size()[1])
            .attr('preserveAspectRatio', 'xMinYMin')
          .append("g")
          .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
      
        const texts = svg.selectAll("text")
          .data(words)
          .enter()
          
          texts.append("text")
          .style("font-size", (d) => { return d.size + "px"; })
          .style("font-family", "Impact")
          .style('fill',  (d) => { return (color(Math.random() * colorData.length)); })
          .attr("text-anchor", "middle")
          .attr("transform", (d) => {return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")"; })
          .text((d) => { return d.text; })   
        }
      }

    render() { 
        return ( <div id={this.state.id} className="WordCloud"></div> );
    }
}
 
export default WordCloud;