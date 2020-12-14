#!/usr/bin/env python
# coding: utf-8

# In[1]:


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
import json
import requests
import os
from azure.cognitiveservices.language.textanalytics import TextAnalyticsClient
from msrest.authentication import CognitiveServicesCredentials


# In[2]:


#Setting the random see and getting the current working directory
np.random.seed(1)
local_path = os.getcwd()


# In[3]:


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

# In[4]:


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

    with open(download_file_path, "wb") as download_file:
        download_file.write(blob_client.download_blob().readall())
    
    return local_file_name


# #### Getting the sentiment labels and ranges from DB

# In[5]:


def get_sentiment_label_from_DB():
    #df=pd.read_csv('Master.csv')
    df=dbc.fetch_data("select SENTIMENT_ID,SENTIMENT_TYPES,SENTIMENT_RANGE from [SAAB_ML_MASTER_SENTIMENTS_DM] where [DOMAIN_ID]="+cfg.client_details['Domain_ID'] +"order by SENTIMENT_ID")
    return df


# #### Setting up the credential and end point for the text analytics API

# In[6]:


def authenticateClient():
    subscription_key=cfg.azure_details['text_API_subscription_key']
    endpoint=cfg.azure_details['text_API_endpoint']
    credentials = CognitiveServicesCredentials(subscription_key)
    text_analytics_client = TextAnalyticsClient(endpoint=endpoint, credentials=credentials)
    return text_analytics_client


# #### Getting the sentiment score from azure text api

# In[7]:


def get_sentiment_score_from_Azure(df_staging):
    df_staging["Language"]=cfg.client_details['call_language1']
    df_staging['text']=df_staging['Raw Transcripts'].replace(regex=True,to_replace=r'[^A-Za-z0-9]',value=r' ')
    
    df_staging['id'] = range(1, len(df_staging) + 1)
    
    df_api=df_staging[['id','Language', 'text']]
    out_dict=df_api.to_dict('records')
    df_result=pd.DataFrame(columns={'Call_ID','ID_Doc','Sentiment_Score'})
    id_returned=[]
    Sentiment_Score=[]
    df_result['Call_ID']=df_staging['Call_ID']
    
    client = authenticateClient()
    response = client.sentiment(documents=out_dict)
    for document in response.documents:
        id_returned.append(document.id)
        Sentiment_Score.append(format(document.score))
        
    
    df_result['ID_Doc']=id_returned
    df_result['Sentiment_Score']=Sentiment_Score

    return df_result
    


# #### Staging the final data frame for sentiment score

# In[8]:


def staging_final_dataframe(preprocessed_data,df_sentiment_Score,df_master_sentiments):
    
    sentiment_id=[]
    for index,row in df_sentiment_Score.iterrows():
        
        if float(row['Sentiment_Score']) >=  df_master_sentiments['SENTIMENT_RANGE'][0]:
            sentiment_id.append(df_master_sentiments['SENTIMENT_ID'][0])
        elif float(row['Sentiment_Score']) >=  df_master_sentiments['SENTIMENT_RANGE'][1] and float(row['Sentiment_Score']) <  df_master_sentiments['SENTIMENT_RANGE'][0]:
            sentiment_id.append(df_master_sentiments['SENTIMENT_ID'][1])
        elif float(row['Sentiment_Score']) >=  df_master_sentiments['SENTIMENT_RANGE'][2] and float(row['Sentiment_Score']) <  df_master_sentiments['SENTIMENT_RANGE'][1]:
            sentiment_id.append(df_master_sentiments['SENTIMENT_ID'][2])
    
    df_sentiment_Score['sentiment_id']=sentiment_id

    final_df=pd.merge(df_sentiment_Score, preprocessed_data, how ='outer', left_on='Call_ID',right_on='Call_ID')
    result_df=pd.DataFrame()
    result_df['Result_Id'] = final_df['id']
    result_df['CALL_ID'] = final_df['Call_ID']
    result_df['DOMAIN_ID'] = int(cfg.client_details['Domain_ID'])
    result_df['SENTIMENT_ID'] = final_df['sentiment_id']
    result_df['SENTIMENT_SCORE'] = final_df['Sentiment_Score']
    result_df['CREATED_DATE'] = datetime.datetime.now()
    result_df['CREATED_BY'] = cfg.client_details['UserName']

    return result_df  


# #### Saving the sentiment score into DB

# In[9]:


def insert_data_into_database(df):
    conn = pyodbc.connect('DRIVER='+cfg.mysql['driver']+';SERVER='+cfg.mysql['server']+';PORT='+cfg.mysql['PORT']+';DATABASE='+cfg.mysql['database']+';UID='+cfg.mysql['username']+';PWD='+ cfg.mysql['password'])
    cursor = conn.cursor()
    for index,row in df.iterrows():
        cursor.execute("INSERT INTO [dbo].[SAAB_ML_SENTIMENTS_FT]([RESULT_ID],[CALL_ID],[DOMAIN_ID],[SENTIMENT_ID],[SENTIMENT_SCORE],[CREATED_DATE],[CREATED_BY],[UPDATED_DATE],[UPDATED_BY])VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)",row['Result_Id'],row['CALL_ID'],row['DOMAIN_ID'],row['SENTIMENT_ID'],row['SENTIMENT_SCORE'],datetime.datetime.now(),row['CREATED_BY'],datetime.datetime.now(),row['CREATED_BY'])
    conn.commit()
    cursor.close()
    conn.close()


# In[10]:


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
    
    logging.debug("Fetching the sentiments and threshold from DB")
    try:
        #Fetch the topics to be created from database
        df_master_sentiments=get_sentiment_label_from_DB()
        logging.debug("Sentiments and threshold fetched from DB")
    except Exception as err:
        if "Could not open a connection to SQL Server" in str(err):
            logging.error("Could not connect to data warehouse : "+str(err.args)+"\nTraceback :"+str(err.with_traceback))
        else:
            logging.error("Error occured with database :"+str(err.args)+"\nTraceback :"+str(err.with_traceback))
        sys.exit(1)
    
    logging.debug("Getting the sentiment score from azure cognitive service")
    try:
        #storing the downloaded file into a dataframe
        df_sentiment_Score=get_sentiment_score_from_Azure(preprocessed_data)
        logging.debug("Sentiment Score fetched from azure cognitive service")
        
    except Exception as err:
        logging.error("Error occured : "+str(err.args)+"\nTraceback :"+str(err.with_traceback))
        sys.exit(1)
    
    logging.debug("Getting the sentiment score from azure cognitive service")
    try:
        #storing the downloaded file into a dataframe
        df_sentiment_Score=get_sentiment_score_from_Azure(preprocessed_data)
        logging.debug("Sentiment Score fetched from azure cognitive service")
        
    except Exception as err:
        logging.error("Error occured : "+str(err.args)+"\nTraceback :"+str(err.with_traceback))
        sys.exit(1)
    
    
    logging.debug("Staging data to be inserted into database")
    try:
        final_df = staging_final_dataframe(preprocessed_data,df_sentiment_Score,df_master_sentiments)
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
        logging.debug("End of sentiment analysis")
  
    


# In[11]:


if __name__ == "__main__":
    main()


# In[ ]:




