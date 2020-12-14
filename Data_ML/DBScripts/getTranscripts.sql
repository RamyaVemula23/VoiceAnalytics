
drop procedure getTranscripts
CREATE Procedure getTranscripts
as
select api_location,call_ID,file_name from Fact_Audio_Processed where transcription_generated = 0



EXEC getTranscripts

