#!/usr/bin/env python
# coding: utf-8

# In[50]:


import pandas as pd
import ConfigFile as cfg
import DB_Connection as dbc
import gensim
import logging
import pyodbc
import datetime
import time
import os
import sys
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer
from azure.storage.blob import ContainerClient,BlobClient,BlobServiceClient


# In[51]:


#Setting the random see and getting the current working directory
np.random.seed(1)
local_path = os.getcwd()


# In[52]:


#creating a unique id with the help of current date timestamp
st = datetime.datetime.fromtimestamp(time.time()).strftime('%d%m%Y%H%M%S')
clientname=cfg.client_name['clientname']
logging.basicConfig(
    filename=clientname+"_"+st+".log",
    level=logging.DEBUG,
    format="%(asctime)s:%(levelname)s:%(message)s"
)
logging.getLogger(clientname)


# #### Fetching the preprocessed file from azure

# In[53]:


def get_preprocessed_file_from_azure():
    service = ContainerClient(account_url=cfg.azure_details['account_url'],container_name=cfg.azure_details['storage_preprocessed_transcripts'], credential=cfg.azure_details['azure_storage_account_key'])
    blob_list = service.list_blobs()
    blob_name=''
    for blob in blob_list:
        blob_name = blob.name
    
    # Create the BlobServiceClient object which will be used to create a container client
    blob_service_client = BlobServiceClient.from_connection_string(cfg.azure_details['account_connection_string'])
    local_file_name = blob_name
    full_path_to_file = os.path.join(local_path, local_file_name)
    # Create a blob client using the local file name as the name for the blob
    container_name="preprocessed-transcripts"
    blob_client = blob_service_client.get_blob_client(container=cfg.azure_details['storage_preprocessed_transcripts'], blob=local_file_name)
    download_file_path = os.path.join(local_path, local_file_name)
    print("\nDownloading blob to \n\t" + download_file_path)

    with open(download_file_path, "wb") as download_file:
        download_file.write(blob_client.download_blob().readall())
    
    return local_file_name


# #### Getting the total number of topics that needs to be created for this domain of customer

# In[54]:


def get_topics_from_DB():
    #df=pd.read_csv('Master.csv')
    df=dbc.fetch_data("select calltopic_id,calltopics from [SAAB_ML_MASTER_CALLTOPICS_DM] where [DOMAIN_ID]="+cfg.client_details['Domain_ID'] +"order by calltopic_id")
    return df


# #### Building the topic modelling 

# In[55]:


def train_LDA_Model(preprocessed_data,Number_Of_Topics):
    # Getting trigram  
    vectorizer = CountVectorizer(ngram_range = (3,3)) 
    X1=vectorizer.fit_transform(preprocessed_data['Preprocessed Transcripts'])
    trigrams=[]
    for text in preprocessed_data['Preprocessed Transcripts']:
        text=[text,]
        X1=(vectorizer.fit_transform(text))
        trigrams.append(vectorizer.get_feature_names()) 
    num_topics=Number_Of_Topics
    preprocessed_data['trigram_Transcript']=trigrams
    dictionary = gensim.corpora.Dictionary(preprocessed_data['trigram_Transcript'])
    
    bow_corpus = [dictionary.doc2bow(doc) for doc in preprocessed_data['trigram_Transcript']]
    lda_model =  gensim.models.LdaMulticore(bow_corpus, 
                                       num_topics = num_topics, 
                                       id2word = dictionary,                                    
                                       passes =10,
                                       workers = 1,random_state = np.random.seed(111))
    
    coherence_model_lda = gensim.models.CoherenceModel(model=lda_model, texts=preprocessed_data['trigram_Transcript'], dictionary=dictionary, coherence='c_v')
    coherence_lda = coherence_model_lda.get_coherence()
    #print('\nCoherence Score: ', coherence_lda)
    
    return lda_model,lda_model.log_perplexity(bow_corpus),coherence_lda,bow_corpus
    


# #### Predicting the topics for the calls

# In[61]:


def predict_topics(bow_corpus,lda_model,num_topics):
    #predicting on the corpus
    doc_lda = lda_model[bow_corpus]
    results=[]
    for topic in doc_lda:
        results.append(topic)
    
    #Getting the topics into a dataframe as column name and scores for each topic into cell per call
    cols=[]
    for i in range(0,num_topics):
        cols.append("Topic_"+str(i+1))
    df_Topics=pd.DataFrame(columns=cols)
    
    for index in range(len(results)):
        col_val=''
        for item in (results[index]):
            df_Topics.set_value(index, "Topic_"+str(item[0]+1), str(item[1]))
    
    return df_Topics


# #### Final dataframe to be used to insert data into DB

# In[57]:


def staging_final_dataframe(preprocessed_data,df_Topics,df_master_topics):
    df_Topics.columns=df_master_topics.calltopics
    preprocessed_data=pd.concat([preprocessed_data, df_Topics], axis=1)
    preprocessed_data.drop(['Raw Transcripts', 'Preprocessed Transcripts'], axis=1, inplace=True)
    value_vars=df_master_topics.calltopics.to_list()
    df_result=pd.melt(preprocessed_data, id_vars =['Call_ID'], value_vars =value_vars ,
              var_name ='CallTopic', value_name ='CALLTOPIC_SCORE').dropna().sort_values('Call_ID')
    final_df=pd.merge(df_result, df_master_topics, how ='outer', left_on='CallTopic',right_on='calltopics')     
    
    final_df.sort_values(by=['Call_ID'],inplace=True)
    final_df.reset_index(drop=True, inplace=True)
    
    final_df["Domain_ID"]=int(cfg.client_details['Domain_ID'])
    final_df['CREATED_BY']=cfg.client_details['UserName']
    final_df['RESULT_ID']=final_df.index+1
    final_df.drop(['CallTopic', 'calltopics'], axis=1, inplace=True)
    
    column_titles = ['RESULT_ID','Call_ID','Domain_ID','calltopic_id','CALLTOPIC_SCORE','CREATED_BY']
    final_df.reindex(columns=column_titles)
    
    return final_df   


# #### Inserting the topic id and topic id score for each call into DB

# In[58]:


def insert_data_into_database(df):
    conn = pyodbc.connect('DRIVER='+cfg.mysql['driver']+';SERVER='+cfg.mysql['server']+';PORT='+cfg.mysql['PORT']+';DATABASE='+cfg.mysql['database']+';UID='+cfg.mysql['username']+';PWD='+ cfg.mysql['password'])
    cursor = conn.cursor()
    for index,row in df.iterrows():
        cursor.execute("INSERT INTO [dbo].[SAAB_ML_CALLTOPICS_FT]([RESULT_ID],[CALL_ID],[DOMAIN_ID],[CALLTOPIC_ID],[CALLTOPIC_SCORE],[CREATED_DATE],[CREATED_BY])VALUES(?, ?, ?, ?, ?, ?, ?)", row['RESULT_ID'],row['Call_ID'],row['Domain_ID'],float(row['calltopic_id']),row['CALLTOPIC_SCORE'],datetime.datetime.now(),row['CREATED_BY'])
    conn.commit()
    cursor.close()
    conn.close()


# In[59]:


def main():
    
    logging.debug("Download preprocessed transcripts file from azure storage")
    try:
        #download preprocessed data file from azure blob storage
        local_file_name=get_preprocessed_file_from_azure()
        logging.debug("Downloaded preprocessed transcripts file from azure storage")
    except Exception as err:
        logging.error("Error occured while fetching file from azure storage :"+str(err.args)+"\nTraceback :"+str(err.with_traceback))
        sys.exit(1)
    
    logging.debug("Reading the downloaded preprocessed transcripts file into a dataframe")
    try:
        #storing the downloaded file into a dataframe
        preprocessed_data=pd.read_csv(local_file_name)
        logging.debug("Dataframe is populated with preprocessed transcripts")
        
    except Exception as err:
        logging.error("Error occured : "+str(err.args)+"\nTraceback :"+str(err.with_traceback))
        sys.exit(1)
    
    logging.debug("Fetching the topics to be created for the dataset from DB")
    try:
        #Fetch the topics to be created from database
        df_master_topics=get_topics_from_DB()
        logging.debug("Topics fetched from DB")
    except Exception as err:
        if "Could not open a connection to SQL Server" in str(err):
            logging.error("Could not connect to data warehouse : "+str(err.args)+"\nTraceback :"+str(err.with_traceback))
        else:
            logging.error("Error occured with database :"+str(err.args)+"\nTraceback :"+str(err.with_traceback))
        sys.exit(1)
    
    logging.debug("Building the LDA model and getting model metrics")
    try:
        #Get the number of topics that needs to be created as part of this analysis
        Number_Of_Topics=len(df_master_topics)
        
        #Build the LDA model
        lda_model,perplexity_score,coherence_lda,bow_corpus=train_LDA_Model(preprocessed_data,Number_Of_Topics)
        logging.debug("LDA model is trained")
    
    except Exception as err:
        logging.error("Error occured : "+str(err.args)+"\nTraceback :"+str(err.with_traceback))
        sys.exit(1)
    
    
    logging.debug("Topics Generated ")
    for idx, topic in lda_model.print_topics(-1):
        logging.debug("Topic: {} \nWords: {}".format(idx, topic ))
    
    logging.debug("Predicting the topics")
    try:
        df_topics=predict_topics(bow_corpus,lda_model,Number_Of_Topics)
        logging.debug("Prediction of topics is completed for each call")
    except Exception as err:
        logging.error("Error occured : "+str(err.args)+"\nTraceback :"+str(err.with_traceback))
        sys.exit(1)
    
    logging.debug("Staging data to be inserted into database")
    try:
        final_df = staging_final_dataframe(preprocessed_data,df_topics,df_master_topics)
        logging.debug("Final data frame is ready to be inserted into database")
    except Exception as err:
        logging.error("Error occured : "+str(err.args)+"\nTraceback :"+str(err.with_traceback))
        sys.exit(1)
    
    logging.debug("Push data into database")
    try:
        insert_data_into_database(final_df)
        logging.debug("Data inserted into database")
    except Exception as err:
        if "Could not open a connection to SQL Server" in str(err):
            logging.error("Could not connect to data warehouse : "+str(err.args)+"\nTraceback :"+str(err.with_traceback))
        else:
            logging.error("Error occured with database :"+str(err.args)+"\nTraceback :"+str(err.with_traceback))
        sys.exit(1)
    finally:
        logging.debug("End of call topics")
    


# In[ ]:


if __name__ == "__main__":
    main()

