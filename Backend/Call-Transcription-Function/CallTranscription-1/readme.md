## Summary
Call Transcription Function: It is a Azure Function associated with Http Trigger event. This has following functionalities  
  1. It receives a token from IssueToken service of speech
  2. It generates SAS uri's for each blob in a container.
  3. With the token from speech issueToken and the SAS uri's ,it makes a call to the transcription api .

### Specifiction of each function
We will use OAuth verfication for our speech cognitive sevices. For this we will have IssueToken for services of speech. After OAuth we have created workload for Batch Transcription API   
* processBlobs()-This function is used for returning all the blobs in the input conatiner.
* getSAS()- This function is using forEach loop through the container for getting the SAS URI for each blob. 
* callTranscriptionApi()- This  function internally calls _axiosCall()_ which hits **batch transcription Api** with each SAS URI and give us the respone .
* insertRecords()- This function  will store all the responses in Azure Synapse database table     **'Fact_Audio_Processed'**.
