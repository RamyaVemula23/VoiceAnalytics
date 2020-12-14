# Sentiment Analysis
	This KPI provides information regarding the sentiment within a 	conversation at the call centre. 
	Sentiment analysis models detect the polarity (i.e. positive, negative or neutral) within the text or transcript
	of a conversation between the agent and customer.

# What is the problem
	While a direct feedback (i.e. like, dislike etc) from customer regarding products and services is always helpful,
	often customer do not provide these pivotal feedbacks. Such insights could be derived from the call
	centre conversations to test the water.
  	Business could get a lot of insight into how the offered products and services are perceived by 
	the customers by testing the sentiment in the conversation transcripts.  

# What is the analysis done on the raw data
	The raw transcripts (that was generated from azure speech to text API) was diarised i.e. each speaker 
	spoken sentence was marked against Speaker 1 or 2. For each diarised sentence the sentiment was segregated as 
	positive, negative and neutral. Each label had a score against them.From this score and labelling the sentiment within 
	each spoken sentence Can be determined which was not in the purview of Release – 1.

# What were the thought process to arrive at the steps to be taken to solve the problem. Highlight what was discussed, what options were tried. Limitations and restrictions faced.

	Sentiment score can be determined using ML model for labelled data i.e. when for each call a sentiment score is provided. 
	A ML model can be employed to train on these data points to create a robust system at place and the model can be used to 
	make prediction on new unseen data points to provide a sentiment score.
	For the current dataset there was no sentiment score against the calls hence a ML model could not be created.
	Using the text analytics API from azure, the sentiment score for each call transcript was determined. 
	The API returns score for the entire transcript in the range of 0-1, where 1 is the most positive.
	
	Below is the documentation URL.
	https://docs.microsoft.com/en-in/azure/cognitive-services/text-analytics/overview
	
	For the purpose of this project the below range was decided upon as this divides the sentiment score into clean buckets.
	Sentiment_Types		Sentiment_Range
	Positive		0.7
	Neutral			0.3
	Negative		0


	1 <= Positive Sentiment <= 0.7
	0.7 < Neutral Sentiment <=0.3
	0.3 < Negative Sentiment <= 0


# What are the steps? Describe in detailed flow with diagrams
	- A log file is created named “SAAB_DDMMYYYYHHMMSS.log” in the working directory.
	- The preprocessed file is downloaded from “preprocessed-transcripts” container into the working directory.In this container there would be 1 file named “Preprocessed_Transcripts_DDMMYYYYHHMMSS.csv”
	- The file is imported as a pandas dataframe. This data frame contains the raw transcripts which was received from Azure speech to text API and the preprocessed transcripts per call id.
	- From azure synapse the master sentiment table (SAAB_ML_MASTER_SENTIMENTS_DM) details are fetched. The table contains the sentiment label and sentiment score threshold.
	- To the pandas dataframe, an id column is appended and the dataframe is converted into a dictionary containing ID, Language 		  (which is “en” or English in this case) and the raw transcripts into “text”.
	- The dictionary is created because the Azure sentiment API expects a dictionary in this format.
	- The dictionary is passed to the Azure sentiment API and the API returns a sentiment score per ID.
	- The resultant sentiment score is mapped with the respective call ID.
	- Depending upon the resultant sentiment score and the threshold that was fetched from the master sentiment table labels are
	  assigned to each call id.
	- A result data frame is created with call ID, sentiment label that was determined in the previous step and sentiment score 		  which was received from the API call.
	- This dataframe is inserted into Azure synapse table “SAAB_ML_SENTIMENTS_FT” as a final step.
	- For each and every step logging is maintained and the log file is updated at every step.

![Alt text](https://github.dxc.com/DTC-Bangalore/SAAB/blob/Features_Release1/Data_ML/Codes/Sentiment%20Analysis/Images/Sentiment_Flow_Diagram_v1.0.png)
# What could be done to optimize this? Are there any alternatives?
	The sentiment score for each call is fetched from Azure Sentiment API as sentiment labels or sentiment score for each call 
	is not provided in the data. In the situation where the sentiment labels or scores are provided for the training data, 
	ML model can be trained and the same model can be used to make prediction on unseen data to predict the sentiment score and
	label.
	
