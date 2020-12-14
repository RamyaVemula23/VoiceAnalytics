import logging
import pandas as pd
import pyodbc
import datetime
import time
import os
import sys
import numpy as np
import json
import requests
import os
from azure.cognitiveservices.language.textanalytics import TextAnalyticsClient
from msrest.authentication import CognitiveServicesCredentials
import azure.functions as func


def main(req: func.HttpRequest) -> func.HttpResponse:
    #global model
    global cfg
    logging.info('Python HTTP trigger function processed a request.')
    
    #try:
        # modelpath=os.getcwd()+"/httptopicmodeleval/Topic_Modelling.pkl"    
        # model = loadModel(modelpath)
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
    df_master_sentiments=get_sentiment_label_from_DB()
    #df_sentiment_Score=get_sentiment_score_from_Azure(preprocessed_data)
    df_sentiment_Score=get_sentiment_score_from_Azure(preprocessed_data)
    final_df = staging_final_dataframe(preprocessed_data,df_sentiment_Score,df_master_sentiments)
    insert_data_into_database(final_df)
    return "Success"

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
    preprocessed_data=pd.DataFrame(json.loads(raw_data))   
    list_val=[]
    for item in preprocessed_data["Preprocessed Transcripts"]:
        list_val.append(str(item).split(", "))
    preprocessed_data['Preprocessed Transcripts']=list_val
    preprocessed_data['Preprocessed Transcripts']=preprocessed_data['Preprocessed Transcripts'].str[1:-1]
    preprocessed_data['Preprocessed Transcripts'] = preprocessed_data['Preprocessed Transcripts'].astype('str')
    logging.info(preprocessed_data)
    return preprocessed_data

def get_sentiment_label_from_DB():
    #df=pd.read_csv('Master.csv')
    df=fetch_data("select SENTIMENT_ID,SENTIMENT_TYPES,SENTIMENT_RANGE from [SAAB_ML_MASTER_SENTIMENTS_DM] where [DOMAIN_ID]="+ cfg["client_details"]['Domain_ID'] +"order by SENTIMENT_ID")
    return df

def authenticateClient():
    subscription_key=cfg["azure_details"]['text_API_subscription_key']
    endpoint=cfg["azure_details"]['text_API_endpoint']
    credentials = CognitiveServicesCredentials(subscription_key)
    text_analytics_client = TextAnalyticsClient(endpoint=endpoint, credentials=credentials)
    return text_analytics_client

def get_sentiment_score_from_Azure(df_staging):
    df_staging["Language"]=cfg["client_details"]['call_language1']
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
    result_df['DOMAIN_ID'] = int(cfg["client_details"]['Domain_ID'])
    result_df['SENTIMENT_ID'] = final_df['sentiment_id']
    result_df['SENTIMENT_SCORE'] = final_df['Sentiment_Score']
   
    return result_df  

def insert_data_into_database(df):
    conn = pyodbc.connect('DRIVER='+cfg["mysql"]['driver']+';SERVER='+cfg["mysql"]['server']+';PORT='+cfg["mysql"]['PORT']+';DATABASE='+cfg["mysql"]['database']+';UID='+cfg["mysql"]['username']+';PWD='+ cfg["mysql"]['password'])
    cursor = conn.cursor()
    for index,row in df.iterrows():
        cursor.execute("Exec SP_INSERT_SENTIMENTS ?, ?, ?, ?, ?",row['Result_Id'],row['CALL_ID'],row['DOMAIN_ID'],row['SENTIMENT_ID'],row['SENTIMENT_SCORE'])
    conn.commit()
    cursor.close()
    conn.close()
