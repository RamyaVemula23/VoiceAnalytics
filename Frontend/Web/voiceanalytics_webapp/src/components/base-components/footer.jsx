import React, { Component } from 'react';

class Footer extends Component {
    constructor(props) {
        super(props);
        this.state = {  }
    }
    render() { 
        return ( 
        <React.Fragment>
            <footer className="footer mt-auto py-3 bg-black text-light">
                <div className="custom-footer-container row">
                    <div className="col-6">Privacy policy</div>
                    <div className="col-6 text-right">&copy;DXC Technology</div>
                </div>
            </footer>
        </React.Fragment> 
        );
    }
}
 
export default Footer;