GraphQL is a query language for our API, and a server-side runtime for executing queries by using a type system we define for our data. GraphQL is about asking for specific fields on objects and also it is very useful for data fetching. The query has exactly the same shape as the result. This is essential to GraphQL, because we always get back what is expected, and the server knows exactly what fields the client is asking for.
##Example:


```js
const totalCallTopics = {
    getCallTopics: {
        type: CallTopicsResponse,
        resolve: async (root, { input }, context, info) => {
            let totalResults = await callTopics().then(results=>{
                let response = []
                results.forEach(result=>{
                    response.push({
                        ID : result.ID,
                        CallTopic : result.CALLTOPICS,
                        Score : result.Score
                    })
                })
                let jsonResponse = {response};
                console.log(jsonResponse);
                return jsonResponse;    
            })
            return totalResults
        }
    }
}
```
 Once a GraphQL service is running (typically at a URL on a web service), it can send GraphQL queries to validate and execute. A received query is first checked to ensure it only refers to the types and fields defined, then runs the provided functions to produce a result.

The **totalCallTopics()** function sends the response in the same structure as given in the schema in *src/schema/call-topics/callTopicSchema"* . The query above is interactive. That means we can change it as we like and see the new result. We can also pass arguments to fields.This process is similar for the rest of the KPIs.




