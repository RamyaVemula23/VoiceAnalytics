# Call Topics Determination

# What is the problem
	The conversations in a call centre could provide a wide range of information regarding which products or services are 
	being discussed. As it would be a tedious task to listen to every call and decide on the topic or the crux of a conversation 
	in 2-3 words. If at all we could achieve this task of manual labelling, it is possible that hundred thousand calls could 
	end up having thousands of different labels, which would not be of any help to business to understand the most relevant 
	topic being discussed in the calls. To address this problem a ML model is built to collate the transcripts into similar 
	buckets and provide topics for each bucket which provides a business sense.

# What is the analysis done on the raw data
	The raw transcripts were preprocessed. Please refer to the preprocess readme file. 
	The preprocessed transcripts were converted into bigrams (2 adjacent words) and trigram (3 adjacent words). 

# What were the thought process to arrive at the steps to be taken to solve the problem. Highlight what was discussed, what options were tried. Limitations and restrictions faced.
	Topic modelling (the ML model that is employed) is a statistical modelling for discovering the hidden semantic structure in
	documents. Latent Dirichlet Allocation (LDA) is used to classify texts in a document to a topic.
	For the topic modelling using LDA, Gensim, an open source code, was used and implemented. Gensim is highly specialised 
	and very well optimised and offers an easy and swift AI-approach to unstructured texts, based on shallow neural network.


# What are the steps? Describe in detailed flow with diagrams
![Alt text](https://github.dxc.com/DTC-Bangalore/SAAB/blob/Features_Release1/Data_ML/Codes/Call_Topics/Images/Call_Topics_Flow_Diagram.png)

# What could be done to optimize this? Are there any alternatives?
	- The hyperparameters tuning can be investigated.
	- The “coherence” (metric to check how good the topics are formed) can be optimised.
	- Mallet’s implementation using Gensim can be tried as it runs faster and gives better topic segregation. 
	- The data size needs to be huge (corpus size) to create better segregation of topics. 
