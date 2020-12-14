#!/usr/bin/env python
# coding: utf-8

# In[6]:


'''
    This file takes care of all the data warehouse exchanges that would be made from the ML models 
    including and not limited to select, update, insert.
'''
import ConfigFile as cfg
import pyodbc
import pandas as pd


def fetch_data(query):
    import pyodbc
    import pandas as pd
    #Connection String from the config file
    cnxn = pyodbc.connect('DRIVER='+cfg.mysql['driver']+';SERVER='+cfg.mysql['server']+';PORT='+cfg.mysql['PORT']+';DATABASE='+cfg.mysql['database']+';UID='+cfg.mysql['username']+';PWD='+ cfg.mysql['password'])
    cursor = cnxn.cursor()
    
    #Stored procedure to fetch the call id and transcripts for the respective call id.
    data = pd.read_sql_query(query,cnxn)
    
    #Closing the connection
    cursor.close()
    cnxn.close()
    
    return data

