import React, { Component } from 'react';
import './App.css';
import CallTable from './components/CallTable';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      data : []
     }
  }

  componentDidMount() {
            fetch("http://localhost:4000/api/getFactsTable")
                .then(response => response.json())
                .then(res => {
                  this.setState({
                    data : res
                  })
                })
                
        } 

  
  render() { 
    console.log(this.state)
    let {data} = this.state
    return ( 
      <div>
        {data.length === 0 ?<p>Please wait while the data loads</p> :
        <CallTable keys = {Object.keys(data[0])} data = {data} />}
      </div>
     );
  }
}
 
export default App;
