import logging
import azure.functions as func
import json
from sklearn.externals import joblib
import numpy as np
import pickle
import gensim
import pyodbc
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer
import os
import sys
import pandas as pd

def main(req: func.HttpRequest) -> func.HttpResponse:
    global model
    global cfg
    logging.info('Python HTTP trigger function processed a request.')
    
    #try:
    modelpath=os.getcwd()+"/httptopicmodeleval/Topic_Modelling.pkl"    
    model = loadModel(modelpath)
    with open(os.getcwd()+"/ConfigFile.json") as jsonconfig:
        cfg = json.load(jsonconfig)
    response = processRequest(req.get_json())
    return func.HttpResponse(
        response,
        status_code=200
        )
    # except:
    #     logging.info("In exception")
    #     return func.HttpResponse(
    #         str(sys.exc_info()),
    #         status_code=400
    #     )


def processRequest(jsonData):
    preprocessed_data = prepare_dataframe_from_json(jsonData)
    df_master_topics = get_topics_from_DB()
    Number_Of_Topics = len(df_master_topics)
    bow_corpus = data_staging_for_prediction(preprocessed_data)
    df_topics = predict_topics(bow_corpus,model,Number_Of_Topics)
    final_df = staging_final_dataframe(preprocessed_data,df_topics,df_master_topics)
    insert_data_into_database(final_df)
    return "Success"

def loadModel(modelwithfullpath):
    return joblib.load(modelwithfullpath)
    

def fetch_data(query):
    cnxn = pyodbc.connect('DRIVER='+cfg["mysql"]['driver']+';SERVER='+cfg["mysql"]['server']+';PORT='+cfg["mysql"]['PORT']+';DATABASE='+cfg["mysql"]['database']+';UID='+cfg["mysql"]['username']+';PWD='+ cfg["mysql"]['password'])
    cursor = cnxn.cursor()
    
    #Stored procedure to fetch the call id and transcripts for the respective call id.
    df_master_topics = pd.read_sql_query(query,cnxn)
    
    #Closing the connection
    cursor.close()
    cnxn.close()
    return df_master_topics


def prepare_dataframe_from_json(raw_data):
    df=pd.DataFrame(json.loads(raw_data))   
    preprocessed_data=df[['Call_ID','Preprocessed Transcripts']]
    list_val=[]
    for item in preprocessed_data["Preprocessed Transcripts"]:
        list_val.append(str(item).split(", "))
    preprocessed_data['Preprocessed Transcripts']=list_val
    preprocessed_data['Preprocessed Transcripts']=preprocessed_data['Preprocessed Transcripts'].str[1:-1]
    preprocessed_data['Preprocessed Transcripts'] = preprocessed_data['Preprocessed Transcripts'].astype('str')
    logging.info(preprocessed_data)
    return preprocessed_data

def get_topics_from_DB():
    #df=pd.read_csv('Master.csv')
    df=fetch_data("select calltopic_id,calltopics from [SAAB_ML_MASTER_CALLTOPICS_DM] where [DOMAIN_ID]="+cfg["client_details"]['Domain_ID'] +"order by calltopic_id")
    return df

def data_staging_for_prediction(preprocessed_data):
    vectorizer = CountVectorizer(ngram_range = (3,3), lowercase=False)    
    logging.info(preprocessed_data)
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

def staging_final_dataframe(preprocessed_data,df_Topics,df_master_topics):
    df_Topics.columns=df_master_topics.calltopics
    preprocessed_data=pd.concat([preprocessed_data, df_Topics], axis=1)
    preprocessed_data.drop(['Preprocessed Transcripts'], axis=1, inplace=True)
    value_vars=df_master_topics.calltopics.to_list()
    df_result=pd.melt(preprocessed_data, id_vars =['Call_ID'], value_vars =value_vars ,
              var_name ='CallTopic', value_name ='CALLTOPIC_SCORE').dropna().sort_values('Call_ID')
    final_df=pd.merge(df_result, df_master_topics, left_on='CallTopic',right_on='calltopics')     
    
    final_df.sort_values(by=['Call_ID'],inplace=True)
    final_df.reset_index(drop=True, inplace=True)
    
    final_df["Domain_ID"]=int(cfg["client_details"]['Domain_ID'])
    final_df['CREATED_BY']=cfg["client_details"]['UserName']
    final_df['RESULT_ID']=final_df.index+1
    final_df.drop(['CallTopic', 'calltopics'], axis=1, inplace=True)
    
    column_titles = ['RESULT_ID','Call_ID','Domain_ID','calltopic_id','CALLTOPIC_SCORE','CREATED_BY']
    final_df.reindex(columns=column_titles)
    
    return final_df 

def insert_data_into_database(df):
    logging.info(df)
    conn = pyodbc.connect('DRIVER='+cfg["mysql"]['driver']+';SERVER='+cfg["mysql"]['server']+';PORT='+cfg["mysql"]['PORT']+';DATABASE='+cfg["mysql"]['database']+';UID='+cfg["mysql"]['username']+';PWD='+ cfg["mysql"]['password'])
    cursor = conn.cursor()
    for index,row in df.iterrows():        
        cursor.execute("EXEC SP_INSERT_CALLTOPICS ?, ?, ?, ?, ?", row['RESULT_ID'],row['Call_ID'],row['Domain_ID'],float(row['calltopic_id']),row['CALLTOPIC_SCORE'])
    conn.commit()
    cursor.close()
    conn.close() 