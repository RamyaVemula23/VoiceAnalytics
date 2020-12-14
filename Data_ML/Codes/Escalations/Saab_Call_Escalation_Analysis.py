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


# #### Download preprocessed file from azure

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


# #### Get the keywords from DB for escalation

# In[5]:


def get_keywords_from_DB():
    #df=pd.read_csv('Master.csv')
    df=dbc.fetch_data("select [MASTER_ID],[ESCALATION_KEYWORDS],[THREAT_KEYWORDS]  from [SAAB_ML_MASTER_ESCALATION_THREAT_DM] where [DOMAIN_ID]="+cfg.client_details['Domain_ID'])
    return df


# #### Assigning the escalation flag for each call

# In[6]:


def determine_escalation_in_calls(preprocessed_data,df_master_keywords):
    escalation_keywords=df_master_keywords.iloc[0]['ESCALATION_KEYWORDS'].split(',')
    preprocessed_data['HasEscalation'] = 0
    escalationflag = ""
    HasEscalation=[]
    for i in range(len(preprocessed_data)):# df.iterrows():
        Raw_Transcripts = preprocessed_data.iloc[i]['Raw Transcripts']
        Preprocessed_Transcripts = preprocessed_data.iloc[i]['Preprocessed Transcripts']
        for escalation in escalation_keywords:
            if escalation in Raw_Transcripts or escalation in Preprocessed_Transcripts:
                HasEscalation.append(i)
                preprocessed_data.set_value(i,'HasEscalation',1)
                break;
    
    return preprocessed_data


# #### Storing the escalation flag into DB

# In[7]:


def insert_data_into_database(df):
    conn = pyodbc.connect('DRIVER='+cfg.mysql['driver']+';SERVER='+cfg.mysql['server']+';PORT='+cfg.mysql['PORT']+';DATABASE='+cfg.mysql['database']+';UID='+cfg.mysql['username']+';PWD='+ cfg.mysql['password'])
    cursor = conn.cursor()
    id_count=0
    for index,row in df.iterrows():
        id_count+=1
        cursor.execute("INSERT INTO [dbo].[SAAB_ML_ADDITIONAL_RESULT_FT]([RESULT_ID],[DOMAIN_ID],[CALL_ID],[HAS_ESCALATION],[CREATED_DATE],[CREATED_BY])VALUES(?, ?, ?, ?, ?, ?)", str(id_count),int(cfg.client_details['Domain_ID']),int(row['Call_ID']) ,bool(row['HasEscalation']),datetime.datetime.now(),cfg.client_details['UserName'])
    conn.commit()
    cursor.close()
    conn.close()


# In[8]:


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
        
    logging.debug("Fetching the keywords from DB")
    try:
        #Fetch the keywords from database
        df_master_keywords=get_keywords_from_DB()
        logging.debug("Keywords fetched from DB")
    except Exception as err:
        if "Could not open a connection to SQL Server" in str(err):
            logging.error("Could not connect to data warehouse : "+str(err.args)+"\nTraceback :"+str(err.with_traceback))
        else:
            logging.error("Error occured with database :"+str(err.args)+"\nTraceback :"+str(err.with_traceback))
        sys.exit(1)
    
    logging.debug("Fetching the presence of escalation keywords per call")
    try:
        #Verify the keywords presence in the calls
        final_df = determine_escalation_in_calls(preprocessed_data,df_master_keywords)
        logging.debug("Escalation calls determined")
        
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
        logging.debug("End of call escalation analysis")


# In[9]:


if __name__ == "__main__":
    main()


# In[ ]:




