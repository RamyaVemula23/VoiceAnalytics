Each script contains the functions for each of the KPIs. These functions are invoked by the resolvers of the KPIs and they in turn call the **dbConnect()** function from *src/utilities/DbConnect.js* to execute their corresponding procedures and returns a set of data to the resolvers of the respective KPIs.

####Example:
```js
const callTopics = async function getCallTopics(){
    results = await dbConnect("getCallTopics");
    // console.log("*&*&*&*&*&*TOPICS", results);
    return results;

}
```
The **getCallTopics()** function is made *async* so that it can *await* for the results of the dbConnect() call and then the result set is returned to the *resolve* for call topics in *src/queries/callAnalytics/callTopics.js* where this set of data gets resolved to the corresponding fields.

This process is similar for the rest of the KPIs.

