## Summary
CallTranscript-3: It is an Azure Function associated with Http Trigger event. This has following functionalities  
  1. It fetches all call records from the **Fact_Audio_Processed** database whose insights are processed.
  2. Moves all json files associated with each call record fetched in previous step and moves them from **transcribedinsight** to **processed** container.
  3. Updates **Fact_Audio_Processed** for each call record to indicate that the corresponding json files have been moved.

### Specifiction of each function   
* **_queryDatabase()_** - This function calls the stored procedure _fetchInsightsProcessedRecords_ from the **Fact_Audio_Processed** database to fetch all the records whose insights are processed, i.e., _insights\_processed = 1_ in the database.
* **_moveFromTransToProcessed()_** - This function takes 3 parameters: _source container_, _destination container_, and _name of file to be moved_. It runs inside a for loop and moves all the json files corresponding to each call record from **transcribedinsight** to **processed** container and then returns a promise which resolves to 1 if move is successful else rejects and returns 0.
* **_updateIfMoved()_** - This function takes one parameter which is the _call\_ID_ and is called for each record fetched by _queryDatabase()_ once all the json files are successfully moved from **transcribedinsight** to **processed** container for that record. It takes the _call\_ID_ of that call record as parameter and then updates _insights\_processed_ from _1_ to _2_ in the **Fact_Audio_Processed** database indicating that all the json files for that particular call record have been moved.
