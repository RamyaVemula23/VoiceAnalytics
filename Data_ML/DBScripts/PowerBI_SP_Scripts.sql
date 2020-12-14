CREATE PROCEDURE GET_PROCESSED_CALL_COUNT 
AS
BEGIN
    SELECT count(DISTINCT call_ID)
	FROM fact_audio_processed
	WHERE insights_processed = 1;
END

CREATE PROCEDURE SP_GET_PROCESSED_CALL_DETAILS 
AS
BEGIN
    SELECT *
	FROM Fact_Audio_Insights;
END

CREATE PROCEDURE SP_GET_PROCESSED_SPEAKER_DIARISATION 
AS
BEGIN
	SELECT call_id as Call_ID,  
	STRING_AGG ( 
		CONCAT(starttime ,' ',CONCAT('speaker',speakerid), ':',display),
		CHAR(13)+CHAR(10)
		) 
	WITHIN GROUP (
		ORDER BY call_id,starttime ASC 
		)
	as "Speaker Diarisation" 
	FROM Fact_Audio_Insights 
	group by call_id
	ORDER BY call_id
END

CREATE PPROCEDURE SP_GET_PROCESSED_CALL_TRANSCRIPTS 
AS
BEGIN
	SELECT call_id as Call_ID,  
	STRING_AGG ( 
		display,
		CHAR(13)
		) 
	WITHIN GROUP (
		ORDER BY call_id,starttime ASC 
		)
	as "Raw Transcripts" 
	FROM Fact_Audio_Insights 
	group by call_id
	ORDER BY call_id
END
