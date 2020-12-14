import React, { Component } from 'react';

class ErrorBoundary extends Component {
    constructor(props) {
      super(props);
      this.state = { 
        error: null, errorInfo: null
       };
    }
  
    static getDerivedStateFromError(error) { return { hasError: true }}
    componentDidCatch(error, errorInfo) {
      this.setState({
        error: error,
        errorInfo: errorInfo
      })
    }

    render() {
      if (this.state.errorInfo) {
        // Error path
        return (
          <div className="container">
            <h2>Something went wrong.</h2>
            <details style={{ whiteSpace: 'pre-wrap' }}>
              {this.state.error && this.state.error.toString()}
              <br />
              {/* {this.state.errorInfo.componentStack} */}
            </details>
          </div>
        );}
      return this.props.children; 
    }
  }

export default ErrorBoundary;