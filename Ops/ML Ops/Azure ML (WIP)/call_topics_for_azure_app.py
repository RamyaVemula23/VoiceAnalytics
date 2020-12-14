#!/usr/bin/env python
# coding: utf-8

# In[ ]:


def main(req: func.HttpRequest) -> func.HttpResponse:
    global model
    logging.info('Python HTTP trigger function processed a request.')
    logging.info(os.getcwd())
    #modelpath = "./httptopicmodeleval/"
    #file = open("Topic_Modelling.pkl", 'rb')
    model = joblib.load("/Topic_Modelling.pkl")# pickle.load(file)
    #file.close() 
    #loadModel(modelpath)
    #logging.info("Model Loaded" + str(model))
    
    ##############################################################################################
    preprocessed_data = prepare_dataframe_from_json(raw_data)
    df_master_topics = get_topics_from_DB()
    Number_Of_Topics = len(df_master_topics)
    bow_corpus = data_staging_for_prediction(preprocessed_data)
    df_topics = predict_topics(bow_corpus,model,Number_Of_Topics)
    final_df = staging_final_dataframe(preprocessed_data,df_topics,df_master_topics)
    json_output=prepare_json_from_dataframe(final_df)


# In[29]:



def loadModel(modelpath):
    return joblib.load(modelpath+"Topic_Modelling.pkl")


# In[57]:


import sys


# In[62]:


sys.path.insert(0,"C:\Sanjeeb\Project\SAAB\Pickle Files\Call Topics")
model = joblib.load(open(r"C:\Sanjeeb\Project\SAAB\Pickle Files\Call Topics", 'rb')) 


# In[ ]:





# In[50]:


model = joblib.load("C:\\Sanjeeb\\Project\\SAAB\\Pickle Files\\Call Topics\\Topic_Modelling.pkl")


# In[15]:


import json
from sklearn.externals import joblib
import numpy as np
from azureml.core.model import Model
import pickle
import gensim
import pyodbc
import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer


# In[16]:


#df=pd.read_csv("Preprocessed_Transcripts_29012020161128.csv")
#raw_data = df[['Call_ID','Preprocessed Transcripts']].head(5).to_json(orient='records')#[1:-1].replace('},{', '} {')


# In[36]:


client_name = {'clientname' : 'SAAB'}
mysql = {'server': 'saab-server-resource.database.windows.net',
         'database': 'saab_dw_resource',
         'username': 'saabadmin',
         'password': 'p@$$w0rd',
         'driver':'{ODBC Driver 17 for SQL Server}',
         'PORT':'1433'}
client_details = {'Domain_ID':'101','UserName':'stripathy32','call_language1':'en'}


# In[51]:


'''preprocessed_data = prepare_dataframe_from_json(raw_data)
df_master_topics = get_topics_from_DB()
Number_Of_Topics = len(df_master_topics)
bow_corpus = data_staging_for_prediction(preprocessed_data)
df_topics = predict_topics(bow_corpus,model,Number_Of_Topics)
final_df = staging_final_dataframe(preprocessed_data,df_topics,df_master_topics)
json_output=prepare_json_from_dataframe(final_df)'''
    


# In[45]:


def fetch_data(query):
    cnxn = pyodbc.connect('DRIVER='+mysql['driver']+';SERVER='+mysql['server']+';PORT='+mysql['PORT']+';DATABASE='+mysql['database']+';UID='+mysql['username']+';PWD='+ mysql['password'])

    cursor = cnxn.cursor()
    
    #Stored procedure to fetch the call id and transcripts for the respective call id.
    df_master_topics = pd.read_sql_query(query,cnxn)
    
    #Closing the connection
    cursor.close()
    cnxn.close()
    return df_master_topics


# In[30]:


def prepare_json_from_dataframe(final_df):
    out = final_df.to_json(orient='records')
    return out


# In[31]:


def prepare_dataframe_from_json(raw_data):
    df=pd.DataFrame(json.loads(raw_data))
    preprocessed_data=df[['Call_ID','Preprocessed Transcripts']]
    return preprocessed_data


# In[32]:


def get_topics_from_DB():
    #df=pd.read_csv('Master.csv')
    df=fetch_data("select calltopic_id,calltopics from [SAAB_ML_MASTER_CALLTOPICS_DM] where [DOMAIN_ID]="+client_details['Domain_ID'] +"order by calltopic_id")
    return df


# In[33]:


def data_staging_for_prediction(preprocessed_data):
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
    
    return bow_corpus


# In[47]:


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


# In[53]:


def staging_final_dataframe(preprocessed_data,df_Topics,df_master_topics):
    df_Topics.columns=df_master_topics.calltopics
    preprocessed_data=pd.concat([preprocessed_data, df_Topics], axis=1)
    preprocessed_data.drop(['Preprocessed Transcripts'], axis=1, inplace=True)
    value_vars=df_master_topics.calltopics.to_list()
    df_result=pd.melt(preprocessed_data, id_vars =['Call_ID'], value_vars =value_vars ,
              var_name ='CallTopic', value_name ='CALLTOPIC_SCORE').dropna().sort_values('Call_ID')
    final_df=pd.merge(df_result, df_master_topics, how ='outer', left_on='CallTopic',right_on='calltopics')     
    
    final_df.sort_values(by=['Call_ID'],inplace=True)
    final_df.reset_index(drop=True, inplace=True)
    
    final_df["Domain_ID"]=int(client_details['Domain_ID'])
    final_df['CREATED_BY']=client_details['UserName']
    final_df['RESULT_ID']=final_df.index+1
    final_df.drop(['CallTopic', 'calltopics'], axis=1, inplace=True)
    
    column_titles = ['RESULT_ID','Call_ID','Domain_ID','calltopic_id','CALLTOPIC_SCORE','CREATED_BY']
    final_df.reindex(columns=column_titles)
    
    return final_df   


# In[ ]:





# In[ ]:





# In[ ]:




