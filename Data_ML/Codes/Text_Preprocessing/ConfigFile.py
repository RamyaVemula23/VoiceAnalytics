#!/usr/bin/env python
# coding: utf-8

# In[1]:


client_name = {'clientname' : 'SAAB'}
mysql = {'server': 'saab-server-resource.database.windows.net',
         'database': 'saab_dw_resource',
         'username': 'saabadmin',
         'password': 'p@$$w0rd',
         'driver':'{ODBC Driver 17 for SQL Server}',
         'PORT':'1433'}
azure_details={'storage_preprocessed_transcripts':'preprocessed-transcripts',
               'azure_storage_name':'saabstorageresource',
               'azure_storage_account_key':'F6JnfuYCFNKcoRHbNgmlqUMUOanuCK3lqGaIOIUPbLUKFQgzI4U0qy0l9N/uA2v3kyyCdrNdZjWMlvuj0irNDQ=='}
custom_Stopwords={'custom_stopwords':['hdfc_life','thank','good_afternoon','good_morning','ok_madam','ok_mom',
                                      'yeah','yeah','sure','hdfc','like','tell', 'ok_uh','alex','alexa','madam',
                                      'yeah_sure','madam_uh','uh_let','uh_ok','actually_pay']}

