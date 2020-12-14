# Speech Analytics Asset Building - Front End Web Application

## React Application Quick Start Guide

The **front end web application** is developed with _[React.js](https://reactjs.org/)_ and is bootstrapped with _[Create React App](https://github.com/facebook/create-react-app)_. React.js is a JavaScript library for building user interfaces and is maintained by Facebook and a community of individual developers and companies.

### Create React App
_Create React App_ is an officially supported way to create React applications. It offers a modern build setup with no configuration. To create a project called `my-app`, move to your desired directory and run this command:

```shell
cd my-directory
npx create-react-app my-app
```
Running this commands will create a directory called `my-app` inside the current directory. Inside that directory, it will generate the initial project structure and install the transitive dependencies.

### Important Commands
|Command        |Description|
| ------------- | --------- |
|`npm start`    |Runs the app in the development mode. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.|
|`npm test`     |Launches the test runner in the interactive watch mode. See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.|
|`npm run build`|Builds the app for production to the `build` folder. It correctly bundles React in production mode and optimizes the build for the best performance. |
|`npm install dependency`|Allows you to install any additional Dependency with `npm`|


## Voice Analytics Web Applications

>The Web Application displays the dashboard screen for a supervisor of the contact centre displaying the overall call statistics analysis of the agents under him/her.

### Cloning the project

Check out the [github Help Guide](https://help.github.com/en/github/creating-cloning-and-archiving-repositories/cloning-a-repository) to help you with cloning the project. Once you’ve cloned the project, `cd voiceanalytics_webapp` to the directory and run the following commands:

```shell
npm install
npm start
```

This assumes you’ve got Node.js already installed. `npm install` will download all the dependencies defined in `package.json` and `npm start` will run the app in the development mode.

### Folder Structure 

```shell
my-app
├── README.md
├── node_modules
├── package.json
├── .gitignore
├── public
│   ├── favicon.ico
│   ├── index.html
│   ├── logo192.png
│   ├── logo512.png
│   ├── manifest.json
│   └── robots.txt
├── src
│   ├── components
│   │   ├── base-components
│   │   │   ├── ErrorBoundary.jsx
│   │   │   ├── footer.jsx
│   │   │   └── NavBar.jsx
│   │   ├── chart
│   │   │   ├── BarChart.jsx
│   │   │   ├── DonutChart.jsx
│   │   │   ├── LineChart.jsx
│   │   │   └── WordCloud.jsx
│   │   ├── dateRangePicker
│   │   │   ├── calendar.css
│   │   │   ├── Calendar.jsx
│   │   │   ├── DateRangeModal.jsx
│   │   │   └── DateRangePicker.jsx
│   │   └── material
│   │   │   └── SimpleCard.jsx
│   ├── css
│   │   └── style.css
│   ├── data
│   │   ├── graphQLData.js
│   │   └── misc.js
│   ├── font
│   │   ├── Web
│   │   ├── EULA-web.pdf
│   │   └── EULA-web.txt
│   ├── graphQL
│   │   ├── CallTopicsCard.js
│   │   ├── CallTypesCard.js
│   │   ├── RetrieveCards.js
│   │   ├── ScriptAdherence.js
│   │   ├── SentimentScoreCard.js
│   │   └── WordCloudCard.js
│   ├── logo
│   │   ├── calendar_icon.jpg
│   │   └── dxc_logo.jpg
│   ├── pages
│   │   └── dashboard.jsx
│   ├── App.css
│   ├── App.js
│   ├── App.test.js
│   ├── index.css
│   ├── index.js
│   ├── logo.svg
│   └── serviceWorker.js
└── test
    ├── __snapshots__
    │   └── App.test.js.snap 
    ├── App.test.js
    └── setupTests.js
```

### Useful dependencies Dependencies  

| Dependency  | Command | Description |
| ----------- | ------- | ----------- |
|Material UI  |`npm i  @material-ui/core`|**Material UI** is a popular React Framework focused on making React UI development easier, better, and accessible to more people.<br/> For more details, you can take a look at the [Material-ui Documentation](https://material-ui.com/getting-started/installation/).|
|Bootstrap    |`npm i bootstrap`|**Bootstrap** is a free and open-source CSS framework directed at responsive, mobile-first front-end web development. It contains CSS- and JavaScript-based design templates for typography, forms, buttons, navigation, and other interface components.<br/> Read the [Getting started](https://getbootstrap.com/docs/4.4/getting-started/introduction/) guide for more details.|
|d3.js        |`npm i d3`<br /> `npm i d3-cloud`|**D3.js** is a JavaScript library for manipulating documents based on data. D3 helps you bring data to life using HTML, SVG, and CSS.<br/> Please refer to the [d3.js wiki](https://github.com/d3/d3/wiki) on github for more details.<br /> [**d3-cloud**](https://www.npmjs.com/package/d3-cloud) is a Wordle-inspired word cloud layout written in JavaScript and used to construct a cloud layout instance..|
|Apollo Client|`npm i apollo-boost @apollo/react-hooks graphql`| **Apollo Client** is a complete state management library for JavaScript apps. All we need to do is simply write a GraphQL query, and Apollo Client will take care of requesting and caching the data, as well as updating the UI.<br/> To get started with Apollo Client, do go through their [getting started](https://www.apollographql.com/docs/react/get-started/) guide.|
|Moment       |`npm i moment`|**moment.js** is a lightweight JavaScript date library for parsing, validating, manipulating, and formatting dates. Moment supports dates in all standard formats, locales, relative time, and time zones.<br /> Please refer to the [documentation](https://momentjs.com/docs/) at [momentjs.com](https://momentjs.com/) for more details.|

### Application Design

The App at the present stage shows the logged in screen with the dashboard from the perspective of a supervisor of the contact centre and provides the overall call statistics for the calls and the agents under them.

The application makes use of GraphQL queries to retrieve the data from the server. Once the data is retrieved from the server, it is fit to the data `object-model` understandable by the different components and parsed for rendering. 

#### Components
 - **base-components** : These are the simple components involved in the application. These include components like `navbar`, the `ErrorBoundary` etc.

 -  **Charts** : These components contain the main charts used in displaying the data at the dashboard. There are three chart components; [Horizontal Bar Chart](src/components/chart/BarChart.jsx), [Donut Chart](src/components/chart/DonutChart.jsx) and the [Line Chart](src/components/chart/LineChart.jsx) and also the [Word Cloud](src/components/chart/WordCLoud.jsx) is defined here. The first three components are defined using d3.js and the word-cloud is defined using the 
 
 - **DateRangePicker** : The component uses a custom built Calendar component with the help of moment.js. The calendars are called into a modal which can be popped up by clicking the Calendar icon. By default the date range is set to the last one year period. When you set the new date range, the dashboard changes to show the data for the same.  

#### Containers

The containers use GraphQL queies that allows us to retrieve data from the Apollo GraphQL Server and using apollo-client and passes the response objects to respective components for rendering on the dashboard. For more information about the GraphQL Enabled Containers, check out the [Readme](src/graphQL/Readme.md) at src/graphQL.

