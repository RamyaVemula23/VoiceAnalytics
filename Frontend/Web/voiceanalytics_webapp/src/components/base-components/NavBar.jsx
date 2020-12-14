import React, { Component } from 'react';
import logo from './../../logo/dxc_logo.png'
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';

class NavBar extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            nav_1: props.nav_1,
            nav_2: props.nav_2,
         }
    } ;

    render() { 
        let { nav_1, nav_2 } = this.state
        return ( 
        <React.Fragment>
            <div>
                <nav className="navbar navbar-expand-lg navbar-dark bg-black">
                    <a href="https://www.dxc.technology/"><img src={logo} alt="website-logo" className="navbar-brand" width='213px' /></a>
                    
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav mr-auto">
                            <li className="nav-item custom-font-nav-dash"><a id="dashboard" className={nav_1}  href="/dashboard">DASHBOARD</a><span className="active"></span></li>
                            <li className="nav-item custom-font-nav"><a id="call-analytics" className={nav_2}  href="/#">CALL ANALYTICS</a></li>
                        </ul>
                    </div>
                    <IconButton><MenuIcon style={{fill:"white", width:"50px", height:"50px"}} /></IconButton>
                </nav>
            </div>
        </React.Fragment> );
    }
}
 
export default NavBar;