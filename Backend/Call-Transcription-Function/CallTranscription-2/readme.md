  
## Summary:  
It is a HTTP Triggered Azure Function  
Features:  
*  It retrieves the locations of those audio files whose batch transcription status is pending.  
* Now, it will hit each location and checks whether status is succeeded.  
* If the status is succeeded then the results_url will be available, where the batch transcription is located.  
* It will hit each channel in the results_url and then gets batch transcription json as response.  
* That response contains **"segmented results and combined results"**  which will get stored in **"transcribedinsight and transcribed"** containers present in azure blob storage respectively.
* After storing json, it will update the _trancription_generated_ field present in Fact_Audio_Processed table from 0 to 1.  
* In order to avoid redundancy once everything is done, _it will move all raw audio files from input container to processed container_.  

###  Specifications of each function

#### sqlConnection()
* This function connects to datawarehouse

#### getTranscriptsGenerated():  
* This function will call **queryDatabase()** which accepts a parameter of stored procedure named _getTranscripts_.

#### queryDatabase(procedureName):
* This function connects to the datawarehouse and executes the stored procedure.

#### axiosCall():
* It will hit location_url and checks whether the status is succeeded or not. If it is succeeded it will call getTranscriptionJson().
* It also updates the results_url,trancription_fileName based on the call_ID.

#### getTranscriptionJson():
* This will iterate over resultsUrl and for each channel it calls AxiosForTrancription(urlResult,api).

#### AxiosForTrancription(urlResult,api)
* This will make axios call to the channels present in the urlResult and gets the results as json.  
* This json is seggregated as two json files one is combinedResults and another is segmentedResults.
* segmentedResults is for the DS team to perform their analysis.

#### storingToContainers(containerName,data,fileName)
* This function stores the data to containers present in azure with the fileName

#### moveFromInputToProcessed(inputContainer,outputContainer,fileName)
* This function moves the files from inputContainer to outputCoantainer by using the fileNames.









