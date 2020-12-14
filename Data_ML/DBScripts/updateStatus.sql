create procedure updateStatus (@results_url nvarchar(max),@call_ID int)
as

UPDATE Fact_Audio_Processed
SET transcription_generated = 1, results_url = @results_url, transcription_filenames = @transcription_filenames, modified_by='system',modified_date=getdate()
WHERE call_ID = @call_ID;

Go;