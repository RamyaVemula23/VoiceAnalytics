import React from 'react';
import ReactDOM from 'react-dom';
import {cleanup}from '@testing-library/react';
import renderer from 'react-test-renderer';
import App from '../../voiceanalytics_webapp/src/App';

afterEach(cleanup);

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
});

it("matches snapshot",()=>{
const tree=renderer.create(<App/>).toJSON(); //convert in to virtual dom object
expect(tree).toMatchSnapshot();
});

