# GraphQL Enabled Containers

GRaphQL Enabled containers allows us to retrieve data from the _Apollo GraphQL Server_ and using `apollo-client` and passes the response objects to respective components for rendering

The below documentation will give the detailed run-through about the GraphQL Enabled Containers

## Quick Start Guide

The simplest way to get started with Apollo Client is by using Apollo Boost, the starter kit that configures the client. 

Apollo Boost includes packages that we think are essential for building an Apollo app, like our in memory cache, local state management, and error handling. It's also flexible enough to handle features like authentication.

### Installation

In order to get started with using `apollo-client` in react, we will first install the required packages in our application.

```shell
npm install apollo-boost @apollo/react-hooks graphql
```

`apollo-boost`: Package containing everything you need to set up Apollo Client <br />
`@apollo/react-hooks`: React hooks based view layer integration <br />
`graphql`: Also parses your GraphQL queries <br />

### Creating a Client
Once we  have all the dependencies installed, we can start by creating the `apollo-client`. In order to get started using GraphQL in our app, the only thing we need is the GraphQL Server Endpoint. 

In the `App.js`, first import `ApolloClient` from `apollo-boost` and `createHttpLink` from `apollo-link-http` and add the endpoint for our GraphQL server:

```js
import ApolloClient from 'apollo-client';
import { createHttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';

const httpLink = createHttpLink({ uri: 'graphQL-server-URI' });

const client = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache()
  });
```

### Handling Errors

The best way to catch and handle server errors, network errors, and GraphQL errors in the GraphQL network stack when using Apollo Links is by using the `apollo-link-error`. In order to utilise the error handling, let us modify the code in App.js to allow us to handle Errors. For this, first let us import the `onError` from `apollo-link-error`.
```js
import { onError } from "apollo-link-error";

const link = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );
  if (networkError) console.log(`[Network error]: ${networkError}`);
});

// const client = new ApolloClient({
//    link: httpLink,
//    cache: new InMemoryCache()
//  });

const client = new ApolloClient({
    link: errorLink.concat(httpLink),
    cache: new InMemoryCache()
  });
```

**Callbacks:**
- `graphQLErrors`: An array of errors from the GraphQL endpoint
- `networkError`: Any error during the link execution or server response, that wasn't delivered as part of the errors field in the GraphQL result

### Connecting your client to React

To connect Apollo Client to React, you will need to use the `ApolloProvider` component exported from `@apollo/react-hooks`. The `ApolloProvider` is similar to React's `Context.Provider`. It wraps your React app and places the client on the context, which allows you to access it from anywhere in your component tree.

So, let's wrap the React App with an `ApolloProvider`

```js
import { ApolloProvider } from '@apollo/react-hooks';

class App extends Component {
  state = {  }

  render() { 
    return ( 
      <React.Fragment>
        <ApolloProvider client={client}>
          <DashBoard />
        </ApolloProvider>
      </React.Fragment>
     );
  }
}
 
export default App;
```

Once your `ApolloProvider` is hooked up, you're ready to start requesting data with the `useQuery` hook! `useQuery` is a hook exported from `@apollo/react-hooks` that leverages the Hooks API to share GraphQL data with your UI.

### Error Boundaries

Error boundaries are React components that catch JavaScript errors anywhere in their child component tree, log those errors, and display a fallback UI instead of the component tree that crashed. Error boundaries catch errors during rendering, in lifecycle methods, and in constructors of the whole tree below them.

A class component becomes an error boundary if it defines either (or both) of the lifecycle methods static `getDerivedStateFromError()` or `componentDidCatch()`.

Use `static getDerivedStateFromError()` to render a fallback UI after an error has been thrown. Use `componentDidCatch()` to log error information.

We'll create the `ErrorBoundary` as shown below:
```js
import React, { Component } from 'react';

class ErrorBoundary extends Component {
    constructor(props) {
      super(props);
      this.state = { 
        error: null, errorInfo: null
       };
    }
  
    // Update state so the next render will show the fallback UI.
    static getDerivedStateFromError(error) { return { hasError: true }}

    // Set the error and errorInfo states
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
              {this.state.errorInfo.componentStack}
            </details>
          </div>
        );}
      return this.props.children; 
    }
  }

export default ErrorBoundary;
```
Now, in `App.js`, we'll wrap our component with the ErrorBoundary

```js
...
  render() { 
    return ( 
      <React.Fragment>
        <ErrorBoundary>
        <ApolloProvider client={client}>
          <DashBoard />
        </ApolloProvider>
        </ErrorBoundary>
      </React.Fragment>
     );
  }
```

### Executing a query

The `useQuery` React hook is the primary API for executing queries in an Apollo application. 

To run a query within a React component, call `useQuery` and pass it a GraphQL query string. When your component renders, `useQuery` returns an object from Apollo Client that contains `loading`, `error`, and `data` properties you can use to render your UI.

We've explained the process for creating one KPI container _(Call Type)_ here. Rest of the KPIs are similar.

#### GraphQL Queries

First let us create the functions that will be returning the GraphQL queries. 

In order to achieve this, first let us create a new file in the `data` folder called `graphQLData.js`. Over here, we'll import `gql` from `apollo-boost`.

```js
import { gql } from "apollo-boost";
```

Next we'll start creating the functions that return the queries. These functions will take the start-date and the end-date as inputs and return the `gql` wrapped query. 

Move to `../src/data/graphQLData.js` to check out all the functions

```js

// Call types query function

export function CALL_TYPES(startDay, endDay) {
  return gql`
  query {
    getCallTypes(startDate:"${startDay}", endDate:"${endDay}") {
      response {
        ID
        CallType
        Score
      }
    }
  }
`;}

```

#### GQL containers

Now, in the graphQL folder, we'll start by importing the `query` function from the data folder and `useQuery` from `@apollo/react-hooks`

```js 
import { useQuery } from '@apollo/react-hooks';
import {CALL_TOPICS} from './../Data/graphQLData'
```

in the main export function, we'll first get the `startDate` and the `endDate` using `props` and pass the `CALL_TOPICS` query function with the startDate and endDate to the useQuery function.

```js
export default function CallTopicsCard(props) {

    let startDay = props.startDay
    let endDay = props.endDay
    
    const { loading, error, data } = useQuery(CALL_TOPICS(startDay, endDay))
}
```

The whole function looks as below:

```js
export default function CallTopicsCard(props) {
    let startDay = props.startDay
    let endDay = props.endDay

    const { loading, error, data } = useQuery(CALL_TOPICS(startDay, endDay))

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error : {error} </p>;

    let callTopicsRetrieved = data === undefined ? "" : data.getCallTopics.response
    let callTopics = {}
    
    
    for(let i = 0; i < callTopicsRetrieved.length; i++) {
        let callTopicName = callTopicsRetrieved[i].CallTopic
        callTopics[callTopicName] = callTopicsRetrieved[i].Score
    }

    return (
    <React.Fragment>
        <div className="container-padded">
        <Paper className='chart-card-type1' elevation={0} square>
            <p className="card-heading">CALL TOPICS</p>
            <center>
            <DonutChart 
                id = "callTOpics" 
                height = {props.height} 
                scale = "20" 
                data = {callTopics} 
                colorData = {colorData} 
                divClass = "callTopicsDonut" />
            </center>
        </Paper>
        </div>
    </React.Fragment>
    )
}
```


As our query executes and the values of `loading`, `error`, and `data` change, the component can intelligently render different UI elements according to the query's state:

- As long as `loading` is true (indicating the query is still in flight), the component presents a Loading... notice.

- When `loading` is false and there is no error, the query has completed.

When the query is completed, the retrieved data is re-created to according to the requirements and is passed to the chart component. At this point, along with the retrieved data, we also pass the chart ID, its height, the scaling. className and any other props required for the chart.  
