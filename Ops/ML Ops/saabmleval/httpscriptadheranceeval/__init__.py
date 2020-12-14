import logging
import azure.functions as func
import pyodbc
import copy
import ast
import math
from datetime import datetime
import logging
import time
import pickle
import os
import sys
import pandas as pd
import numpy as np
import re
import json
# Text preprocessing imports
import spacy
nlp = spacy.load('en_core_web_sm')

# Modelling and evaluation imports
from sklearn.model_selection import train_test_split
from sklearn.model_selection import StratifiedShuffleSplit
from sklearn.model_selection import KFold  
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.feature_extraction.text import TfidfTransformer
from sklearn.svm import LinearSVC
from sklearn.calibration import CalibratedClassifierCV
from sklearn.naive_bayes import GaussianNB
from sklearn.pipeline import Pipeline
from sklearn.feature_selection import chi2
from sklearn.metrics import f1_score
from sklearn.metrics import precision_recall_fscore_support, accuracy_score


def main(req: func.HttpRequest) -> func.HttpResponse:
    # global model
    global cfg
    logging.info('Python HTTP trigger function processed a request.')    
    # try:
    
    with open(os.getcwd()+"/ConfigFile.json") as jsonconfig:
        cfg = json.load(jsonconfig)
    response = processRequest()
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

def processRequest():
    agent_customer_identification()
    script_adherance()
    return "Success"

def agent_customer_identification():
    azure_data=fetch_data("select  * from [dbo].[Fact_Audio_Insights] where call_id not in (select call_id from [dbo].[SAAB_ML_SPEAKER_MAPPING_FT])order by [Call_ID],[StartTime]")
    azure_lemmatized_text = preprocess_text(azure_data,7)
    azure_data['Lemmatized_Text'] = azure_lemmatized_text
    azure_distict_call_ids = list(azure_data['Call_ID'].unique())
    with open(os.getcwd()+"/httpscriptadheranceeval/finalized_agent_customer_identification_model.sav", 'rb') as f:
        final_trained_model = pickle.load(f)
    call_agent_ids = get_call_agent_speaker_id(5,azure_data,azure_distict_call_ids,final_trained_model)
    copy_azure_data = copy.deepcopy(azure_data)
    copy_azure_data['Agent_ID'] = copy_azure_data['Call_ID'].map(call_agent_ids)
    copy_azure_data['Labels'] = np.where(copy_azure_data['SpeakerId'] == copy_azure_data['Agent_ID'],'A','C')
    call_speaker_labels_df = copy_azure_data[['Call_ID','SpeakerId','Labels','StartTime']].groupby(['Call_ID','SpeakerId','Labels']).count().reset_index().drop('StartTime',axis=1)
    #call_speaker_labels_df.to_csv("call_speaker_labels_df.csv")
    insert_data_into_database_speaker_mapping(call_speaker_labels_df)

def insert_data_into_database_speaker_mapping(df):
    conn = pyodbc.connect('DRIVER='+cfg["mysql"]['driver']+';SERVER='+cfg["mysql"]['server']+';PORT='+cfg["mysql"]['PORT']+';DATABASE='+cfg["mysql"]['database']+';UID='+cfg["mysql"]['username']+';PWD='+ cfg["mysql"]['password'])
    cursor = conn.cursor()
    
    id_count = int(fetch_data('select max(result_id) from SAAB_ML_SPEAKER_MAPPING_FT').iloc[0])
    for index,row in df.iterrows():
        id_count += 1
        cursor.execute("Exec SP_INSERT_SPEAKERMAPPING ?, ?, ?, ?, ?",id_count,(row['Call_ID']),cfg["client_details"]['Domain_ID'],row['SpeakerId'], row['Labels'])
    conn.commit()
    cursor.close()
    conn.close()

def insert_data_into_database_script_adherance(df):
    conn = pyodbc.connect('DRIVER='+cfg["mysql"]['driver']+';SERVER='+cfg["mysql"]['server']+';PORT='+cfg["mysql"]['PORT']+';DATABASE='+cfg["mysql"]['database']+';UID='+cfg["mysql"]['username']+';PWD='+ cfg["mysql"]['password'])
    cursor = conn.cursor()
    id_count = int(fetch_data('select max(result_id) from SAAB_ML_SCRIPT_ADHERANCE_FT').iloc[0])
    for index,row in df.iterrows():
        id_count += 1
        cursor.execute("Exec SP_INSERT_SCRIPTADHERANCE ?, ?, ?, ?, ?",id_count,row['DOMAIN_ID'],row['SCRIPT_ID'],row['CALL_ID'],row['SCORE'])
    conn.commit()
    cursor.close()
    conn.close()

def fetch_data(query):
    import pyodbc
    import pandas as pd
    #Connection String from the config file
    cnxn = pyodbc.connect('DRIVER='+cfg["mysql"]['driver']+';SERVER='+cfg["mysql"]['server']+';PORT='+cfg["mysql"]['PORT']+';DATABASE='+cfg["mysql"]['database']+';UID='+cfg["mysql"]['username']+';PWD='+ cfg["mysql"]['password'])
    cursor = cnxn.cursor()
    
    #Stored procedure to fetch the call id and transcripts for the respective call id.
    data = pd.read_sql_query(query,cnxn)
    
    #Closing the connection
    cursor.close()
    cnxn.close()
    
    return data

def preprocess_text(input_dataframe,target_column_number):
    # Preprocessing text
    lemmatized_text = []
    for row in input_dataframe.itertuples():
        # Removing extra spaces, special characters and punctuation marks and lower casing the text
        clean_text = re.sub(r'\s\s+',r' ',re.sub(r'[?|$|.|!|#|%|^|*|:|;|,|+|-|_|=|&]',r'',row[target_column_number].lower()))
        # Lemmatizing the text
        lemmatized_text.append(" ".join([str(token.lemma_).replace('-PRON-',str(token)) for token in nlp(str(clean_text))]))
    return lemmatized_text

def get_call_agent_speaker_id(number_of_turns_considered,azure_data,azure_distict_call_ids,trained_model):
    call_agent_ids = {}
    agent_spk_id = np.nan
    for call_id in azure_distict_call_ids:

        temp_data = azure_data[azure_data['Call_ID']==call_id][['Call_ID','SpeakerId','StartTime','Display','Lemmatized_Text']]
        labels = trained_model.predict(temp_data['Lemmatized_Text'])    
        # Assuming always will have a 9 or greater turns
        if len(temp_data) >= 9:
            agent_spk_id = np.nan
            # Getting the speaker id counts for agent label in all the three sections
            intro_A_counts = get_speaker_A_count(list(temp_data[:number_of_turns_considered].SpeakerId),list(labels[:number_of_turns_considered])) 
            closure_A_counts = get_speaker_A_count(list(temp_data[-(number_of_turns_considered):].SpeakerId),list(labels[-(number_of_turns_considered):])) 
            mid_A_counts = get_speaker_A_count(list(temp_data[number_of_turns_considered:-(number_of_turns_considered)].SpeakerId),list(labels[number_of_turns_considered:-(number_of_turns_considered)])) 
            # Getting the speaker id counts for customer label in all the three sections
            intro_C_counts = get_speaker_C_count(list(temp_data[:number_of_turns_considered].SpeakerId),list(labels[:number_of_turns_considered])) 
            closure_C_counts = get_speaker_C_count(list(temp_data[-(number_of_turns_considered):].SpeakerId),list(labels[-(number_of_turns_considered):])) 
            mid_C_counts = get_speaker_C_count(list(temp_data[number_of_turns_considered:-(number_of_turns_considered)].SpeakerId),list(labels[number_of_turns_considered:-(number_of_turns_considered)])) 

            intro_agent_id , intro_cust_id = assign_speaker_by_section(intro_A_counts,intro_C_counts)
            closure_agent_id , closure_cust_id = assign_speaker_by_section(closure_A_counts,closure_C_counts)

            # First check intro and closure section for majority count of the speaker ids and then tie breaker using the mid section
            if (not math.isnan(intro_agent_id) and not math.isnan(closure_agent_id)):
                if intro_agent_id == closure_agent_id:
                    agent_spk_id = intro_agent_id
                else:
                    mid_agent_id , mid_cust_id = assign_speaker_by_section(mid_A_counts,mid_C_counts)
                    if not math.isnan(mid_agent_id):
                        agent_spk_id = mid_agent_id
                    else:
                        agent_spk_id = intro_agent_id

            elif not math.isnan(intro_agent_id):
                agent_spk_id = intro_agent_id
            elif not math.isnan(closure_agent_id):
                agent_spk_id = closure_agent_id
            else:
                mid_agent_id , mid_cust_id = assign_speaker_by_section(mid_A_counts,mid_C_counts)
                if not math.isnan(mid_agent_id):
                    agent_spk_id = mid_agent_id

        call_agent_ids[call_id] = agent_spk_id
    return call_agent_ids

# Function returns the count of agent labels for each of the speaker
def get_speaker_A_count(section_spk_list,pred_labels_list):
    labels = {}
    spk_2_count = 0
    spk_1_count = 0
    for i in list(zip(section_spk_list,pred_labels_list)):
        if ((i[0] == 2) and (i[1] == 'A')):
            spk_2_count += 1
        elif ((i[0]==1 and (i[1]=='A'))):
            spk_1_count += 1
    labels['Spk_2_A_Count'] = spk_2_count
    labels['Spk_1_A_Count'] = spk_1_count
    return labels

# Function returns the count of customer labels for each of the speaker
def get_speaker_C_count(section_spk_list,pred_labels_list):
    labels = {}
    spk_2_count = 0
    spk_1_count = 0
    for i in list(zip(section_spk_list,pred_labels_list)):
        if ((i[0] == 2) and (i[1] == 'C')):
            spk_2_count += 1
        elif ((i[0]==1 and (i[1]=='C'))):
            spk_1_count += 1
    labels['Spk_2_C_Count'] = spk_2_count
    labels['Spk_1_C_Count'] = spk_1_count
    return labels

def assign_speaker_by_section(agent_count_dict,cust_count_dict):
    
    agent_speaker = np.nan
    cust_speaker = np.nan

    if (((agent_count_dict['Spk_1_A_Count']) > (cust_count_dict['Spk_1_C_Count'])) and ((cust_count_dict['Spk_2_C_Count']) > (agent_count_dict['Spk_2_A_Count']))):
        agent_speaker = 1
        cust_speaker = 2
    elif (((agent_count_dict['Spk_1_A_Count']) > (cust_count_dict['Spk_1_C_Count'])) and ((cust_count_dict['Spk_2_C_Count']) == (agent_count_dict['Spk_2_A_Count']))):
        agent_speaker = 1
        cust_speaker = 2
    elif (((agent_count_dict['Spk_1_A_Count']) > (cust_count_dict['Spk_1_C_Count'])) and ((cust_count_dict['Spk_2_C_Count']) < (agent_count_dict['Spk_2_A_Count']))):
        if (agent_count_dict['Spk_2_A_Count'] > agent_count_dict['Spk_1_A_Count']):
            agent_speaker = 2
            cust_speaker = 1
        elif ((agent_count_dict['Spk_2_A_Count'] < agent_count_dict['Spk_1_A_Count'])):
            agent_speaker = 1
            cust_speaker = 2
    elif (((agent_count_dict['Spk_1_A_Count']) == (cust_count_dict['Spk_1_C_Count'])) and ((cust_count_dict['Spk_2_C_Count']) > (agent_count_dict['Spk_2_A_Count']))):
        agent_speaker = 1
        cust_speaker = 2
    elif (((agent_count_dict['Spk_1_A_Count']) == (cust_count_dict['Spk_1_C_Count'])) and ((cust_count_dict['Spk_2_C_Count']) == (agent_count_dict['Spk_2_A_Count']))):
        pass
    elif (((agent_count_dict['Spk_1_A_Count']) == (cust_count_dict['Spk_1_C_Count'])) and ((cust_count_dict['Spk_2_C_Count']) < (agent_count_dict['Spk_2_A_Count']))):
#         print("this condition")
        agent_speaker = 2
        cust_speaker = 1        
    elif ((agent_count_dict['Spk_1_A_Count'] < cust_count_dict['Spk_1_C_Count']) and (cust_count_dict['Spk_2_C_Count'] > agent_count_dict['Spk_2_A_Count'])):
        if (cust_count_dict['Spk_2_C_Count'] > cust_count_dict['Spk_1_C_Count']):
            agent_speaker = 1
            cust_speaker = 2
        elif ((cust_count_dict['Spk_2_C_Count'] < cust_count_dict['Spk_1_C_Count'])):
            agent_speaker = 2
            cust_speaker = 1
    elif (((agent_count_dict['Spk_1_A_Count']) < (cust_count_dict['Spk_1_C_Count'])) and ((cust_count_dict['Spk_2_C_Count']) == (agent_count_dict['Spk_2_A_Count']))):
        agent_speaker = 2
        cust_speaker = 1
    elif (((agent_count_dict['Spk_1_A_Count']) < (cust_count_dict['Spk_1_C_Count'])) and ((cust_count_dict['Spk_2_C_Count']) < (agent_count_dict['Spk_2_A_Count']))):
        agent_speaker = 2
        cust_speaker = 1
    return agent_speaker,cust_speaker

def script_adherance():
    raw_transcript_data = fetch_data("select * from [dbo].[Fact_Audio_Insights] where call_id not in (select call_id from [dbo].[SAAB_ML_SCRIPT_ADHERANCE_FT]) order by [Call_ID],[StartTime]")
    agent_label_data = fetch_data("select * from [dbo].[SAAB_ML_SPEAKER_MAPPING_FT] where call_id not in (select call_id from [dbo].[SAAB_ML_SCRIPT_ADHERANCE_FT]) order by Result_ID")
    adherance_data = fetch_data("select * from [dbo].[SAAB_ML_MASTER_SCRIPT_ADHERANCE_DM] where DOMAIN_ID = " + str(cfg["client_details"]['Domain_ID']))
    
    for row in agent_label_data.itertuples():
            agent_label_data.loc[row[0],'Transcripts'] = ":".join(list(raw_transcript_data[((raw_transcript_data['Call_ID']==row[2]) & (raw_transcript_data['SpeakerId']==row[4]))].Display))
    
    agent_label_data['Lemmatized_Transcript']  = preprocess_text_for_script_adherance(agent_label_data,10)
    agent_label_data['Adherance_Scores'] = np.where(agent_label_data['LABEL']=='A',agent_label_data['Lemmatized_Transcript'].apply(adherance_check,adherance=adherance_data),"")
    script_ft_df = pd.concat([pd.DataFrame(agent_label_data[agent_label_data['LABEL']=='A'].DOMAIN_ID),pd.DataFrame(agent_label_data[agent_label_data['LABEL']=='A'].CALL_ID),agent_label_data[agent_label_data['LABEL']=='A'].Adherance_Scores.apply(pd.Series)],axis=1)
    script_ft_df = script_ft_df.melt(id_vars=["DOMAIN_ID","CALL_ID"], var_name="SCRIPT_ID",value_name="SCORE").sort_values('CALL_ID')
    #script_ft_df.to_csv("script_ft_df.csv")
    insert_data_into_database_script_adherance(script_ft_df)
    

def preprocess_text_for_script_adherance(input_dataframe,target_column_number):
    # Preprocessing text
    lemmatized_text = []
    count = 0
    for row in input_dataframe.itertuples():
#         print(row)
        # Removing extra spaces, special characters and punctuation marks and lower casing the text
        clean_text = re.sub(r'\s\s+',r' ',re.sub(r'[?|$|.|!|#|%|^|*|;|,|+|-|_|=|&]',r'',row[target_column_number].lower()))
        # Lemmatizing the text
        
        lemmatized_text.append(" ".join([str(token.lemma_).replace('-PRON-',str(token)) for token in nlp(str(clean_text))]))
    return lemmatized_text

def adherance_check(row_data,adherance):#row_data,
    # Retrieving lsit of keywords for each kind of adherance
    adherance_check_list = {}
    for row in adherance.itertuples():
        for section in ast.literal_eval(row[5]):
            sections_score = {}
            if(section=='Greetings'):
                    row_data.split(":")[:5]
            elif(section=='Closure'):
                row_data.split(":")[5:]
            for phrase in ast.literal_eval(row[5])[section]:
                if phrase in row_data:
                    sections_score[section] = 1

        adherance_check_list[row[3]] = round(len(sections_score)/len(ast.literal_eval(row[5])),2)
        
    return adherance_check_list


