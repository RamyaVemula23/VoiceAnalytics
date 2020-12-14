The DB Scripts contain stored procedures which can be run once the SAAB_ML tables are created.
The stored procedures are invoked by the GraphQL query resolvers.

1. getCalls : retrieves total no. of calls from Fact_Audio_Processed
2. getCallTopics : retrieves count of each call topic from SAAB_ML_CALLTOPICS_FT and SAAB_ML_MASTER_CALLTOPICS_DM
3. getCallTypes : retrieves count of each call type from SAAB_ML_CALLTYPES_FT and SAAB_ML_MASTER_CALLTYPES_DM
4. getEscalations : retrieves count of escalations from SAAB_ML_ADDITIONAL_RESULT_FT
5. getScriptAdherence : retrieves count of scripts from SAAB_ML_SCRIPT_ADHERANCE_FT and SAAB_ML_MASTER_SCRIPT_ADHERANCE_DM
6. getTextSentiment: 
7. getThreats : retrieves count of threats from SAAB_ML_ADDITIONAL_RESULT_FT
8. getWordCount : retrieves top 200 bigrams with highest frequency from SAAB_ML_WORDCOUNT_FT