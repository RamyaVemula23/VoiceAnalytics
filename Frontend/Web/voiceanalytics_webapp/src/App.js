import React, { Component } from 'react';
import DashBoard from './pages/DashBoard';
import ApolloClient from 'apollo-client';
import { ApolloProvider } from '@apollo/react-hooks';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { createHttpLink } from 'apollo-link-http';
import { onError } from "apollo-link-error";
import ErrorBoundary from './components/base-components/ErrorBoundary'

  // const httpLink = createHttpLink({ uri: 'https://graphql-app.azurewebsites.net/graphql-server?code=AqxqBJsnF3BF8ERzZruUpUx8qeGMwR8jAq0M6wDWomGhfrRxp7hbiA==' })
  const httpLink = createHttpLink({ uri: 'http://localhost:7071/graphql-server' })

  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, locations, path }) => {
        console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
      }); 
    }
    else if (networkError) { 
      console.log(`[Network error]: ${networkError}`);
    } 
  });

  const client = new ApolloClient({
    link: errorLink.concat(httpLink),
    cache: new InMemoryCache()
  });

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { }
  }

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
}
 
export default App;