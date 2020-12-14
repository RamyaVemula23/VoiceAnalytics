# Agent Customer Identification


# What is the problem

The Azure Speech to Text gives out the raw transcript which is diarized but however it is crucial for us to know which piece of text
is spoken by the agent and customer for further analysis.

# What are the analysis done on the raw data
The preprocessing steps done for this feature were :
1. Strip extra white spaces
2. Remove special characters and punctuation
3. Lemmatization

# What were the thought process to arrive at the steps to be taken to solve the problem. Highlight what was discussed, what options were tried. Limitations and restrictions faced
There were 2 approaches that were discussed :
1. **Keyword based classifier**
	Here we have a dictionary of key phrases accumulated that are typically spoken by an agent and then build a majority voting classifier.
	This classifier would look into 3 sections of the raw transcript i.e. Introduction, Mid, Closure and their respective key phrases and assign a count to each of the speaker as they match the key phrases. The speaker with the most counts is tagged as an Agent
		
*Limitation* :- Heavily dependent on the key phrases and its different variations and the performance is dependent on the quality of diarization

2. **ML classifier**
	Here we build an ML model for the classification of the transcripts. Used the manual labeled transcripts  for this purpose
	Built a linear support vector classifier using tf-idf scores
		
*Limitation* :- Performance is dependent on the quality of diarization
		
		


# What are the steps ? Describe in detailed flow with diagrams

![Alt text](https://github.dxc.com/DTC-Bangalore/SAAB/blob/Features_Release1/Data_ML/Codes/Agent_Customer_Classification/Documents/Picture1.png)

# What could be done to optimize this ? Are there any alternatives ?

- Ensure sufficient samples of different variations of agent transcripts are captured
- Modifying the chi2 threshold for finding the best features
- Try different models
