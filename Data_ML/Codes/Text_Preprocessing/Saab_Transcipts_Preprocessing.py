#!/usr/bin/env python
# coding: utf-8

# In[20]:


import ConfigFile as cfg
import DB_Connection as dbc
import pandas as pd
import pyodbc
import numpy as np
import datetime
import logging
import time
from azure.storage.blob import BlockBlobService
from azure.storage.blob import ContentSettings
import os
import gensim
from gensim.utils import simple_preprocess
from gensim.parsing.preprocessing import STOPWORDS

'''from nltk.stem.porter import *
import numpy as np
import nltk
nltk.download('wordnet')'''
import spacy
import en_core_web_sm
nlp = en_core_web_sm.load()

np.random.seed(400)


# In[21]:


#creating a unique id with the help of current date timestamp
st = datetime.datetime.fromtimestamp(time.time()).strftime('%d%m%Y%H%M%S')
clientname=cfg.client_name['clientname']
logging.basicConfig(
    filename=clientname+"_"+st+".log",
    level=logging.DEBUG,
    format="%(asctime)s:%(levelname)s:%(message)s"
)
logging.getLogger(clientname)


# In[22]:


def splitting_transcripts_to_sentences(raw_transcripts):
    #spliting the raw transcript into sentences.
    gensim_text=[]
    for transcripts in raw_transcripts['Raw Transcripts']:
        gensim_text.append(list(gensim.summarization.textcleaner.get_sentences(str(transcripts).replace('\r',' '))))
    
    #Appending the splitted sentences to the dataframe
    raw_transcripts["Full_Sentences"] = gensim_text
    return raw_transcripts


# In[23]:


def lemmatizing_splitted_transcripts(raw_transcripts_gensim):
    #lemmatizing the splitted sentence transcript and removing the POS tagging for pronouns
    test_list=[]
    for full_text in raw_transcripts_gensim["Full_Sentences"]:
         test_list.append(" ".join([str(token.lemma_).replace('-PRON-','') for token in nlp(str(full_text))]))

    #Appending the lemmatized transcript to the dataframe
    raw_transcripts_gensim["Lemmatized_transcript"]=test_list
    return raw_transcripts_gensim


# In[24]:


'''
Function to remove gensim defined stopwords and new custom stop words from the transcript
'''
def preprocess(text):
    newStopWords =cfg.custom_Stopwords['custom_stopwords']
    result=[]
    for token in text :
        if token not in (gensim.parsing.preprocessing.STOPWORDS and  newStopWords) and len(token) > 3:
            #print(token)
            result.append((token))
    return result


# In[25]:


def create_bigrams_and_remove_Stopwords(raw_transcripts_gensim):
    #creating phrases like good_afternoon, hdfc_life so that they can be removed as part of custom stop words.
    Preprocessed_Transcripts=[]
    bigrams=[]
    import gensim, pprint
    for transcripts in raw_transcripts_gensim["Lemmatized_transcript"]:
        tokens = [list(gensim.utils.tokenize(transcripts, lower=True))]

        bigram_mdl = gensim.models.phrases.Phrases(tokens, min_count=1, threshold=5)
        #Preprocessed_Transcripts.append(token_bigrams(transcripts))
        from gensim.parsing.preprocessing import preprocess_string, remove_stopwords
        CUSTOM_FILTERS = [remove_stopwords]
        #if token not in gensim.parsing.preprocessing.STOPWORDS and len(token) > 3
        tokens = [preprocess_string(" ".join(word), CUSTOM_FILTERS) for word in tokens]
        bigrams = bigram_mdl[tokens]
        Preprocessed_Transcripts.append(list(bigrams))   
    
    #final step of preprocessing to remove stop words
    Final_Preprocessed_Transcripts=[]
    for tokenised_text in Preprocessed_Transcripts:
        #print(tokenised_text)
        for token in tokenised_text:
            Final_Preprocessed_Transcripts.append(preprocess(token))
    
     #Appending the final preprocessed transcript to the dataframe
    raw_transcripts_gensim["Preprocessed Transcripts"]=Final_Preprocessed_Transcripts
    
    return raw_transcripts_gensim


# In[26]:


def move_file_to_azure(filename):
    #fetching the blob account details, account key and container name from config file.
    accountname=cfg.azure_details['azure_storage_name']
    accountkey=cfg.azure_details['azure_storage_account_key']
    containername=cfg.azure_details['storage_preprocessed_transcripts']
    filepath=os.getcwd()
    block_blob_service = BlockBlobService(account_name=accountname, account_key=accountkey)
    #Upload the CSV file to Azure cloud
    block_blob_service.create_blob_from_path(container_name= containername,
                                             blob_name=filename,
                                             file_path=filepath+'\\'+filename,content_settings=ContentSettings(content_type='application/CSV'))
    
    return 'Done'


# In[27]:


import sys
def main():
    logging.debug("Starting preprocessing")
    raw_transcripts = pd.DataFrame()
    #Get the raw transcripts from the data warehouse
    try:
        raw_transcripts=dbc.fetch_data("exec dbo.[SP_GET_PROCESSED_CALL_TRANSCRIPTS]")
    except Exception as err:
        if "Could not open a connection to SQL Server" in str(err):
            logging.error("Could not connect to data warehouse : "+str(err.args)+"\nTraceback :"+str(err.with_traceback))
        else:
            logging.error("Error occured with database :"+str(err.args)+"\nTraceback :"+str(err.with_traceback))
        sys.exit(1)
    
    try:
        #Get the transcripts splitted into meaningful sentences.
        raw_transcripts=splitting_transcripts_to_sentences(raw_transcripts)
        #Get lemmas for the splitted sentences
        transcripts_df=lemmatizing_splitted_transcripts(raw_transcripts)
        #Remove stop words from the lemmatized dataframe after bigrams are created
        transcripts_df=create_bigrams_and_remove_Stopwords(transcripts_df) 
        
        #Dropping the temporary columns which were created in the datafram
        transcripts_df.drop(['Full_Sentences', 'Lemmatized_transcript'], axis=1, inplace=True)

        #creating the filename with the unique id for the dataframe to be stored into
        filename = "Preprocessed_Transcripts_" + str(st) + ".csv"

        #creating the file for the dataframe
        raw_transcripts.to_csv(filename,index=False)
        
    except Exception as err:
        logging.error("Error occured : "+str(err.args)+"\nTraceback :"+str(err.with_traceback))
        sys.exit(1)
    
    try:
        status = move_file_to_azure(filename)
    except Exception as err:
        logging.error("Error occured while pushing file to azure storage :"+str(err.args)+"\nTraceback :"+str(err.with_traceback))
        sys.exit(1)
    finally:
        logging.debug("End of prepreocessing")
        
    


# In[28]:


if __name__ == "__main__":
    main()


# In[ ]:





# In[ ]:




