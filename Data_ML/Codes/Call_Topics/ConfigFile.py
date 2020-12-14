#!/usr/bin/env python
# coding: utf-8

# In[1]:


client_name = {'clientname' : 'SAAB'}
client_details = {'Domain_ID':'101','UserName':'stripathy32'}
mysql = {'server': 'saab-server-resource.database.windows.net',
         'database': 'saab_dw_resource',
         'username': 'saabadmin',
         'password': 'p@$$w0rd',
         'driver':'{ODBC Driver 17 for SQL Server}',
         'PORT':'1433'}
azure_details={'storage_preprocessed_transcripts':'preprocessed-transcripts',
               'azure_storage_name':'saabstorageresource',
               'azure_storage_account_key':'F6JnfuYCFNKcoRHbNgmlqUMUOanuCK3lqGaIOIUPbLUKFQgzI4U0qy0l9N/uA2v3kyyCdrNdZjWMlvuj0irNDQ==',
               'account_url':'https://saabstorageresource.blob.core.windows.net',
               'account_connection_string':'DefaultEndpointsProtocol=https;AccountName=saabstorageresource;AccountKey=kepMV9z3gBmtSVQVicoGZbr+IKEjHE5ympQ3J5uD+KBI34/rSb0+bRfA3z/3mpdEbmzEFJ3ZIGg/0AyQs8TPhw==;EndpointSuffix=core.windows.net'}
custom_Stopwords={'custom_stopwords':['hdfc_life','thank','good_afternoon','good_morning','ok_madam','ok_mom',
                                      'yeah','yeah','sure','hdfc','like','tell','welcome','', 'ok_uh','alex','alexa','madam',
                                      'yeah_sure','madam_uh','uh_let','uh_ok','actually_pay','afternoon','morning','verification']}

