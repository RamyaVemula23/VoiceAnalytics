import azure.functions as func
import pandas as pd
import pyodbc
import numpy as np
import datetime
import logging
import time
import os
import gensim
from gensim.utils import simple_preprocess
from gensim.parsing.preprocessing import STOPWORDS
import spacy
import sys
import json
nlp = spacy.load('en_core_web_sm')

def main(req: func.HttpRequest) -> func.HttpResponse:
    #global model
    global cfg
    logging.info('Python HTTP trigger function processed a request.')
    logging.info('This should be the first call to the pipeline')
    
    #try:
    #modelpath=os.getcwd()+"/httptopicmodeleval/Topic_Modelling.pkl"    
    #model = loadModel(modelpath)
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
    raw_transcripts = pd.DataFrame()
    raw_transcripts=fetch_data("exec dbo.[SP_GET_TRANSCRIPTS_NEW_CALLS]")
    raw_transcripts=splitting_transcripts_to_sentences(raw_transcripts)
    transcripts_df=lemmatizing_splitted_transcripts(raw_transcripts)
    transcripts_df=create_bigrams_and_remove_Stopwords(transcripts_df)
    transcripts_df.drop(['Full_Sentences', 'Lemmatized_transcript'], axis=1, inplace=True)
    json_output = prepare_json_from_dataframe(transcripts_df)
    return json_output

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

def prepare_json_from_dataframe(final_df):
    out = final_df.to_json(orient='records')
    return out


def splitting_transcripts_to_sentences(raw_transcripts):
    #spliting the raw transcript into sentences.
    gensim_text=[]
    for transcripts in raw_transcripts['Raw Transcripts']:
        gensim_text.append(list(gensim.summarization.textcleaner.get_sentences(str(transcripts).replace('\\r',' '))))
    
    #Appending the splitted sentences to the dataframe
    raw_transcripts["Full_Sentences"] = gensim_text
    return raw_transcripts

def lemmatizing_splitted_transcripts(raw_transcripts_gensim):
    #lemmatizing the splitted sentence transcript and removing the POS tagging for pronouns
    test_list=[]
    for full_text in raw_transcripts_gensim["Full_Sentences"]:
         test_list.append(" ".join([str(token.lemma_).replace('-PRON-','') for token in nlp(str(full_text))]))

    #Appending the lemmatized transcript to the dataframe
    raw_transcripts_gensim["Lemmatized_transcript"]=test_list
    return raw_transcripts_gensim

def preprocess(text):
    newStopWords =cfg["custom_Stopwords"]['custom_stopwords']
    result=[]
    for token in text :
        if token not in (gensim.parsing.preprocessing.STOPWORDS and  newStopWords) and len(token) > 3:
            #print(token)
            result.append((token))
    return result

def create_bigrams_and_remove_Stopwords(raw_transcripts_gensim):
    #creating phrases like good_afternoon, hdfc_life so that they can be removed as part of custom stop words.
    Preprocessed_Transcripts=[]
    bigrams=[]
    import gensim, pprint
    for transcripts in raw_transcripts_gensim["Lemmatized_transcript"]:
        tokens = [list(gensim.utils.tokenize(transcripts, lower=True))]

        bigram_mdl = gensim.models.phrases.Phrases(tokens, min_count=1, threshold=5)
        #Preprocessed_Transcripts.append(token_bigrams(transcripts))
        from gensim.parsing.preprocessing import preprocess_string, remove_stopwords
        CUSTOM_FILTERS = [remove_stopwords]
        #if token not in gensim.parsing.preprocessing.STOPWORDS and len(token) > 3
        tokens = [preprocess_string(" ".join(word), CUSTOM_FILTERS) for word in tokens]
        bigrams = bigram_mdl[tokens]
        Preprocessed_Transcripts.append(list(bigrams))   
    
    #final step of preprocessing to remove stop words
    Final_Preprocessed_Transcripts=[]
    for tokenised_text in Preprocessed_Transcripts:
        #print(tokenised_text)
        for token in tokenised_text:
            Final_Preprocessed_Transcripts.append(preprocess(token))
    
     #Appending the final preprocessed transcript to the dataframe
    raw_transcripts_gensim["Preprocessed Transcripts"]=Final_Preprocessed_Transcripts
    
    return raw_transcripts_gensim 