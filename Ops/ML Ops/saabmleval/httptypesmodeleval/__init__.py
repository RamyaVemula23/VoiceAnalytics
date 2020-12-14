import logging
import pyodbc
import copy
import math
from datetime import datetime
import logging
import time
import os
import sys
from io import StringIO
import ast 
import json
import pandas as pd
import numpy as np
import re
from sklearn.externals import joblib
# Modelling and evaluation imports
from sklearn.model_selection import train_test_split
from sklearn.model_selection import StratifiedShuffleSplit
from sklearn.model_selection import KFold  
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.feature_extraction.text import TfidfTransformer
from sklearn.svm import LinearSVC
from sklearn.calibration import CalibratedClassifierCV
from sklearn.pipeline import Pipeline
from sklearn.feature_selection import chi2
from sklearn.metrics import f1_score
from sklearn.metrics import precision_recall_fscore_support, accuracy_score
import pickle
import azure.functions as func

def main(req: func.HttpRequest) -> func.HttpResponse:
    global model
    global cfg
    logging.info('Python HTTP trigger function processed a request.')
    
    # try:
    modelpath=os.getcwd()+"/httptypesmodeleval/finalized_call_type_model.sav"    
    model = loadModel(modelpath)
    with open(os.getcwd()+"/ConfigFile.json") as jsonconfig:
        cfg = json.load(jsonconfig)
    response = processRequest(req.get_json())
    return func.HttpResponse(
        response,
        status_code=200
    )
    # except Exception as e:
    #     logging.info("In exception" + str(e))
    #     return func.HttpResponse(
    #         str(sys.exc_info()),
    #         status_code=400
    #     )

def processRequest(jsonData):
    preprocessed_data = prepare_dataframe_from_json(jsonData)
    master_call_types = get_topics_from_DB()
    df_types = predict_types(model,preprocessed_data)
    final_df = staging_final_dataframe(df_types,master_call_types)
    insert_data_into_database(final_df)
    return "Success"

def loadModel(modelwithfullpath):
    return joblib.load(modelwithfullpath)

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

def predict_types(model,preprocessed_data):
    df_predict = preprocessed_data['Preprocessed Transcripts'].apply(lambda x: " ".join(ast.literal_eval(x.replace("_"," "))))
    predicted_labels_value = model.predict(df_predict)
    preprocessed_data['Call_Type']=predicted_labels_value
    return preprocessed_data

def fetch_data(query):
    cnxn = pyodbc.connect('DRIVER='+cfg["mysql"]['driver']+';SERVER='+cfg["mysql"]['server']+';PORT='+cfg["mysql"]['PORT']+';DATABASE='+cfg["mysql"]['database']+';UID='+cfg["mysql"]['username']+';PWD='+ cfg["mysql"]['password'])
    cursor = cnxn.cursor()    
    #Stored procedure to fetch the call id and transcripts for the respective call id.
    df_types = pd.read_sql_query(query,cnxn)    
    #Closing the connection
    cursor.close()
    cnxn.close()
    return df_types

def get_topics_from_DB():
    df=fetch_data("select * from [dbo].[SAAB_ML_MASTER_CALLTYPES_DM] where [DOMAIN_ID]="+cfg["client_details"]['Domain_ID'] +"order by CALLTYPE")
    return df

def staging_final_dataframe(preprocessed_data,master_call_types):
    staging_dataframe = pd.merge(preprocessed_data,master_call_types,left_on="Call_Type",right_on="CALLTYPE")
    final_df=staging_dataframe[['Call_ID','CALLTYPE_ID']]
    return final_df

def insert_data_into_database(df):
    logging.info(df)
    logging.info(df.dtypes)
    logging.info(int(cfg["client_details"]['Domain_ID']))
    conn = pyodbc.connect('DRIVER='+cfg["mysql"]['driver']+';SERVER='+cfg["mysql"]['server']+';PORT='+cfg["mysql"]['PORT']+';DATABASE='+cfg["mysql"]['database']+';UID='+cfg["mysql"]['username']+';PWD='+ cfg["mysql"]['password'])
    cursor = conn.cursor()
    id_count = int(fetch_data('select max(MASTER_ID) from SAAB_ML_CALLTYPES_FT').iloc[0])
    for index,row in df.iterrows():
        id_count += 1
        cursor.execute("Exec SP_INSERT_CALLTYPES ?, ?, ?, ?",id_count,int(cfg["client_details"]['Domain_ID']),int(row['CALLTYPE_ID']),int(row['Call_ID']))
    conn.commit()
    cursor.close()
    conn.close()
