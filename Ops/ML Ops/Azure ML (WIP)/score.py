import json
from sklearn.externals import joblib
import numpy as np
from azureml.core.model import Model
import pickle
import gensim
import pyodbc
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer
from azureml.core import Workspace
#ws = Workspace.create(name='saab_ml_workspace', subscription_id='047ae087-7d35-4c57-8fe9-7a442cc9cf16', resource_group='Speech_Analytics')

from azureml.core.authentication import ServicePrincipalAuthentication
from azureml.core import Workspace
svc_pr_password = "sWR5y]ocjTTMxT@7H13YXWFRcss=.nrN"

svc_pr = ServicePrincipalAuthentication(
    tenant_id="93f33571-550f-43cf-b09f-cd331338d086",
    service_principal_id="0a89e69e-7aae-4a80-8b76-7dc9f65c3d16",
    service_principal_password=svc_pr_password)


ws = Workspace(
    subscription_id="047ae087-7d35-4c57-8fe9-7a442cc9cf16",
    resource_group="Speech_Analytics",
    workspace_name="saab_ml_workspace",
    auth=svc_pr
    )

client_name = {'clientname' : 'SAAB'}
mysql = {'server': 'saab-server-resource.database.windows.net',
         'database': 'saab_dw_resource',
         'username': 'saabadmin',
         'password': 'p@$$w0rd',
         'driver':'{ODBC Driver 17 for SQL Server}',
         'PORT':'1433'}
client_details = {'Domain_ID':'101','UserName':'stripathy32','call_language1':'en'}

# Called when the service is loaded
def init():
    global model
    # Get the path to the registered model file and load it
    model_path = Model.get_model_path('topic_model',5,ws)
    model = joblib.load(model_path)
    print('Init - Successfully run')
# Called when a request is received
def run(raw_data):
    
    print('Starting')
    df=pd.DataFrame(json.loads(raw_data))
    preprocessed_data=df[['Call_ID','Preprocessed Transcripts']]
    print(df[['Call_ID','Preprocessed Transcripts']])
    query="select calltopic_id,calltopics from [SAAB_ML_MASTER_CALLTOPICS_DM] where [DOMAIN_ID]="+client_details['Domain_ID'] +"order by calltopic_id"
    
    cnxn = pyodbc.connect('DRIVER='+mysql['driver']+';SERVER='+mysql['server']+';PORT='+mysql['PORT']+';DATABASE='+mysql['database']+';UID='+mysql['username']+';PWD='+ mysql['password'])

    cursor = cnxn.cursor()
    
    #Stored procedure to fetch the call id and transcripts for the respective call id.
    df_master_topics = pd.read_sql_query(query,cnxn)
    
    #Closing the connection
    cursor.close()
    cnxn.close()
       
    
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

    doc_lda = model[bow_corpus]
    results=[]
    for topic in doc_lda:
        results.append(topic)
    print('Model Prediction is done')
    Number_Of_Topics=len(df_master_topics)
    num_topics=Number_Of_Topics
    #Getting the topics into a dataframe as column name and scores for each topic into cell per call
    cols=[]
    for i in range(0,num_topics):
        cols.append("Topic_"+str(i+1))
    df_Topics=pd.DataFrame(columns=cols)
    
    for index in range(len(results)):
        col_val=''
        for item in (results[index]):
            df_Topics.set_value(index, "Topic_"+str(item[0]+1), str(item[1]))
    
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
    
    print('Ending')
    out = final_df.to_json(orient='records')
    return out