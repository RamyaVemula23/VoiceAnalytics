# Text pre-processing


# What is the problem
  The raw transcripts that was received from Azure speech to text API cannot be used for ML models as it contains common words, punctuations, white spaces and special characters. These act as noise in the data and that needs to be handled.

# What is the analysis done on the raw data
  On the raw transcripts the below steps:
  1) Splitting the raw transcripts into sentences using Gensim sentence pre-processing.
  2) Tokenizing the split sentences using Spacy library.
  3) Lemmatizing the tokens.
  4) Create bigram and trigram common phrases using Gensim phrases.
  5) Remove the Gensim defined stop words and custom stopwords.
    * Stopwords are most common words occurring in the language of corpus i.e. English in this case.

# What were the thought process to arrive at the steps to be taken to solve the problem. Highlight what was discussed, what options were tried. Limitations and restrictions faced
  - Gensim library provides an entire gamut of resources for pre-processing for NLP data and is the current best open source code.
  - The bigrams and trigrams phrase were created to remove the most common phrases that occur in the corpus. For example, phrases like 
    "Good Morning", "Good Afternoon" need to be removed in the entirety. Creating custom stopwords for good and afternoon separately would
     remove all occurrence of "Good" in the corpus along with "Afternoon" and "Morning".
  - In order to remove the current corpus related stopwords, a list of custom stopwords was created.

# What are the steps? Describe in detailed flow with diagrams

![Alt text](https://github.dxc.com/DTC-Bangalore/SAAB/blob/Feature_Release2/Data_ML/Codes/Text_Preprocessing/Images/Preprocess_Flow_Diagram_v1.1.png)

# What could be done to optimize this? Are there any alternatives?
  - A more exhaustive list of custom stopwords can be created by checking the words or phrases that constitute a topic that 
    gets created in the "Call Topics" KPI.
