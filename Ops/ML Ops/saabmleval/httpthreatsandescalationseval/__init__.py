import logging
import azure.functions as func
import sys
import os
import json
import pandas as pd
import pyodbc


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
    df_master_topics=get_keywords_from_DB()
    final_df = determine_escalation_in_calls(preprocessed_data,df_master_topics)
    final_df = determine_threat_in_calls(final_df,df_master_topics)
    insert_data_into_database(final_df)
    return "Success"

def prepare_dataframe_from_json(raw_data):
    preprocessed_data=pd.DataFrame(json.loads(raw_data))   
    #preprocessed_data=df[['Call_ID','Preprocessed Transcripts']]
    list_val=[]
    for item in preprocessed_data["Preprocessed Transcripts"]:
        list_val.append(str(item).split(", "))
    preprocessed_data['Preprocessed Transcripts']=list_val
    preprocessed_data['Preprocessed Transcripts']=preprocessed_data['Preprocessed Transcripts'].str[1:-1]
    preprocessed_data['Preprocessed Transcripts'] = preprocessed_data['Preprocessed Transcripts'].astype('str')
    logging.info(preprocessed_data)
    return preprocessed_data

def get_keywords_from_DB():
    df=fetch_data("select [MASTER_ID],[ESCALATION_KEYWORDS],[THREAT_KEYWORDS]  from [SAAB_ML_MASTER_ESCALATION_THREAT_DM] where [DOMAIN_ID]="+cfg["client_details"]['Domain_ID'])
    return df

def fetch_data(query):
    #Connection String from the config file
    cnxn = pyodbc.connect('DRIVER='+cfg["mysql"]['driver']+';SERVER='+cfg["mysql"]['server']+';PORT='+cfg["mysql"]['PORT']+';DATABASE='+cfg["mysql"]['database']+';UID='+cfg["mysql"]['username']+';PWD='+ cfg["mysql"]['password'])

    cursor = cnxn.cursor()
    
    #Stored procedure to fetch the call id and transcripts for the respective call id.
    data = pd.read_sql_query(query,cnxn)
    
    #Closing the connection
    cursor.close()
    cnxn.close()
    
    return data
    
def determine_escalation_in_calls(preprocessed_data,df_master_topics):
    escalation_keywords=df_master_topics.iloc[0]['ESCALATION_KEYWORDS'].split(',')
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
    
def determine_threat_in_calls(preprocessed_data,df_master_topics):
    escalation_keywords=df_master_topics.iloc[0]['THREAT_KEYWORDS'].split(',')
    preprocessed_data['HasThreat'] = 0
    escalationflag = ""
    HasEscalation=[]
    for i in range(len(preprocessed_data)):# df.iterrows():
        Raw_Transcripts = preprocessed_data.iloc[i]['Raw Transcripts']
        Preprocessed_Transcripts = preprocessed_data.iloc[i]['Preprocessed Transcripts']
        for escalation in escalation_keywords:
            if escalation in Raw_Transcripts or escalation in Preprocessed_Transcripts:
                HasEscalation.append(i)
                preprocessed_data.set_value(i,'HasThreat',1)
                break;
    
    return preprocessed_data

def insert_data_into_database(df):
    conn = pyodbc.connect('DRIVER='+cfg["mysql"]['driver']+';SERVER='+cfg["mysql"]['server']+';PORT='+cfg["mysql"]['PORT']+';DATABASE='+cfg["mysql"]['database']+';UID='+cfg["mysql"]['username']+';PWD='+ cfg["mysql"]['password'])
    cursor = conn.cursor()
    id_count=0
    for index,row in df.iterrows():
        id_count+=1
        cursor.execute("EXEC [SP_INSERT_ADDITIONAL_RESULT] ?, ?, ?, ?, ?", str(id_count),int(cfg["client_details"]['Domain_ID']),int(row['Call_ID']) ,bool(row['HasEscalation']),bool(row['HasThreat']))
    conn.commit()
    cursor.close()
    conn.close()
