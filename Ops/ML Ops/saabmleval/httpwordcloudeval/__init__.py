import logging
import os
import sys
import azure.functions as func
import pyodbc
import copy
import math
from datetime import datetime
import logging
import time
import json
import sys
from io import StringIO

import pandas as pd
import numpy as np

import nltk
from nltk.util import ngrams


def main(req: func.HttpRequest) -> func.HttpResponse:
    #global model
    global cfg
    logging.info('Python HTTP trigger function processed a request.')
    
    #try:
    
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
    preprocessed_data['Preprocessed Transcripts'] = preprocessed_data['Preprocessed Transcripts'].apply(lambda x : " ".join(x.replace("'","").replace("_"," ").strip('][').split(', ') ))
    preprocessed_data['Unigrams'] = preprocessed_data['Preprocessed Transcripts'].apply(lambda x : (x.split(" ")))
    preprocessed_data['Bigrams'] = preprocessed_data['Preprocessed Transcripts'].apply(bigram_generation)
    preprocessed_data['Trigrams'] = preprocessed_data['Unigrams'].apply(trigram_generation)
    preprocessed_data  = preprocessed_data[['Call_ID','Unigrams','Bigrams','Trigrams']]
    preprocessed_data = preprocessed_data.melt(id_vars=["Call_ID"], var_name=["Transcript_Type"],value_name="Transcript").sort_values('Call_ID')
    preprocessed_data['Domain_ID'] = 101
    preprocessed_data['Transcript'] = preprocessed_data['Transcript'].astype(str)
    insert_data_into_database(preprocessed_data)
    return "Success"

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

def bigram_generation(row_data):
    bigram = []
    for i in nltk.bigrams(row_data.split()):
        bigram.append(" ".join(i) )
        
    return str(bigram)

def trigram_generation(row_data):
    trigram = []
    for i in ngrams(row_data,3):
        trigram.append(" ".join(i) )
        
    return str(trigram)

def insert_data_into_database(df):
    conn = pyodbc.connect('DRIVER='+cfg["mysql"]['driver']+';SERVER='+cfg["mysql"]['server']+';PORT='+cfg["mysql"]['PORT']+';DATABASE='+cfg["mysql"]['database']+';UID='+cfg["mysql"]['username']+';PWD='+ cfg["mysql"]['password'])
    cursor = conn.cursor()
    cursor.setinputsizes([(pyodbc.SQL_INTEGER,), (pyodbc.SQL_INTEGER,),(pyodbc.SQL_INTEGER,),(pyodbc.SQL_WVARCHAR,0),(pyodbc.SQL_WVARCHAR,20,0), (pyodbc.SQL_TYPE_TIMESTAMP), (pyodbc.SQL_WVARCHAR,50,0)])
    id_count = 0
    for index,row in df.iterrows():
        id_count +=1
        cursor.execute("EXEC SP_INSERT_WORDCOUNT ?, ?, ?, ?, ?", id_count, row['Call_ID'], row['Domain_ID'],row['Transcript'], row['Transcript_Type'])
    conn.commit()
    cursor.close()
    conn.close()


