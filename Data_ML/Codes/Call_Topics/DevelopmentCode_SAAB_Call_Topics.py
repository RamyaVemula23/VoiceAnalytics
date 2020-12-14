#!/usr/bin/env python
# coding: utf-8

# In[99]:


import pandas as pd
import gensim
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer


# #### Fetching preprocessed data

# In[179]:


preprocessed_data=pd.read_csv('Preprocessed_Transcripts_28012020160602.csv')


# In[180]:


preprocessed_data.head()


# #### Tokenizing preprocessed transcripts to be used for genism dictionary

# In[181]:


tokenising=[]
for text in preprocessed_data['Preprocessed Transcripts']:
    tokenising.append(gensim.utils.simple_preprocess(text))


# In[182]:


preprocessed_data['tokenised']= tokenising


# #### Creating the dictionary object that maps each tokenized word to a unique id

# In[183]:


dictionary = gensim.corpora.Dictionary(preprocessed_data['tokenised'])


# In[184]:


'''
Checking dictionary created
'''
count = 0
for k, v in dictionary.iteritems():
    print(k, v)
    count += 1
    if count > 50:
        break


# #### Creating corpus (bag of words) -  a corpus contains each word’s id and its frequency count in that document

# In[185]:


bow_corpus = [dictionary.doc2bow(doc) for doc in preprocessed_data['tokenised']]


# In[186]:


'''
Preview BOW for our sample preprocessed document
'''
document_num = 1
bow_doc_x = bow_corpus[document_num]

for i in range(len(bow_doc_x)):
    print("Word {} (\"{}\") appears {} time.".format(bow_doc_x[i][0], 
                                                     dictionary[bow_doc_x[i][0]], 
                                                     bow_doc_x[i][1]))


# #### Multi core Gensim LDA model on transcript

# In[187]:



'''
Train your lda model using gensim.models.LdaMulticore and save it to 'lda_model'
'''
# TODO
lda_model =  gensim.models.LdaMulticore(bow_corpus, 
                                   num_topics = 4, 
                                   id2word = dictionary,                                    
                                   passes =5,
                                   workers = 1)


# In[188]:


'''
For each topic, we will explore the words occuring in that topic and its relative weight
'''
for idx, topic in lda_model.print_topics(-1):
    print("Topic: {} \nWords: {}".format(idx, topic ))
    print("\n")


# ##### Perplexity and Coherence

# In[189]:


print('\nPerplexity Score: ', lda_model.log_perplexity(bow_corpus))


# In[190]:


# Compute Coherence Score
coherence_model_lda = gensim.models.CoherenceModel(model=lda_model, texts=preprocessed_data['tokenised'], dictionary=dictionary, coherence='c_v')
coherence_lda = coherence_model_lda.get_coherence()
print('\nCoherence Score: ', coherence_lda)


# In[212]:


doc_lda = lda_model[bow_corpus]
for topic in doc_lda:
     print("Document Topics      : ", topic)  


# ### LDA with bigrams

# In[192]:


# Getting bigrams  
vectorizer = CountVectorizer(ngram_range = (2,2)) 


# In[193]:


X1=vectorizer.fit_transform(preprocessed_data['Preprocessed Transcripts'])


# In[194]:


bigrams=[]
for text in preprocessed_data['Preprocessed Transcripts']:
    text=[text,]
    X1=(vectorizer.fit_transform(text))
    bigrams.append(vectorizer.get_feature_names()) 


# In[141]:


bigrams


# In[195]:


preprocessed_data['Bigram_Transcript']=bigrams


# In[196]:


dictionary = gensim.corpora.Dictionary(preprocessed_data['Bigram_Transcript'])


# In[197]:


bow_corpus = [dictionary.doc2bow(doc) for doc in preprocessed_data['Bigram_Transcript']]


# In[198]:


lda_model =  gensim.models.LdaMulticore(bow_corpus, 
                                   num_topics = 4, 
                                   id2word = dictionary,                                    
                                   passes =5,
                                   workers = 1)


# In[199]:


for idx, topic in lda_model.print_topics(-1):
    print("Topic: {} \nWords: {}".format(idx, topic ))
    print("\n")


# In[211]:


doc_lda = lda_model[bow_corpus]
for topic in doc_lda:
     print("Document Topics      : ", topic)  


# ### LDA with trigrams

# In[201]:


# Getting trigram  
vectorizer = CountVectorizer(ngram_range = (3,3)) 
X1=vectorizer.fit_transform(preprocessed_data['Preprocessed Transcripts'])
trigrams=[]
for text in preprocessed_data['Preprocessed Transcripts']:
    text=[text,]
    X1=(vectorizer.fit_transform(text))
    trigrams.append(vectorizer.get_feature_names()) 

preprocessed_data['trigram_Transcript']=trigrams
dictionary = gensim.corpora.Dictionary(preprocessed_data['trigram_Transcript'])
bow_corpus = [dictionary.doc2bow(doc) for doc in preprocessed_data['trigram_Transcript']]
lda_model =  gensim.models.LdaMulticore(bow_corpus, 
                                   num_topics = 4, 
                                   id2word = dictionary,                                    
                                   passes =5,
                                   workers = 1)
for idx, topic in lda_model.print_topics(-1):
    print("Topic: {} \nWords: {}".format(idx, topic ))
    print("\n")


# In[210]:


doc_lda = lda_model[bow_corpus]
for topic in doc_lda:
     print("Document Topics      : ", topic)  


# ### LDA with unigram,bigram,trigram

# In[203]:


# Getting unigram,bigram,trigram  
vectorizer = CountVectorizer(ngram_range = (1,3)) 
X1=vectorizer.fit_transform(preprocessed_data['Preprocessed Transcripts'])
trigrams=[]
for text in preprocessed_data['Preprocessed Transcripts']:
    text=[text,]
    X1=(vectorizer.fit_transform(text))
    trigrams.append(vectorizer.get_feature_names()) 

preprocessed_data['trigram_Transcript']=trigrams
dictionary = gensim.corpora.Dictionary(preprocessed_data['trigram_Transcript'])
bow_corpus = [dictionary.doc2bow(doc) for doc in preprocessed_data['trigram_Transcript']]
lda_model =  gensim.models.LdaMulticore(bow_corpus, 
                                   num_topics = 5, 
                                   id2word = dictionary,                                    
                                   passes =5,
                                   workers = 1)
for idx, topic in lda_model.print_topics(-1):
    print("Topic: {} \nWords: {}".format(idx, topic ))
    print("\n")


# In[ ]:





# In[209]:


doc_lda = lda_model[bow_corpus]
for topic in doc_lda:
    print("Document Topics      : ", topic)  


# In[161]:


doc_lda


# In[155]:


trigrams


# In[ ]:




