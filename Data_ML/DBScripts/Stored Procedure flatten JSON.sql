/****** Object:  StoredProcedure [dbo].[sp_flattenjsonintotables]    Script Date: 20-02-2020 14:34:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROC [dbo].[sp_flattenjsonintotables] AS
BEGIN
    -- SET NOCOUNT ON added to prevent extra result sets from
    -- interfering with SELECT statements.
    -- SET NOCOUNT ON

	IF OBJECT_ID('#temp_stg', 'U') IS NOT NULL
		DROP TABLE #temp_stg

	IF OBJECT_ID('#temp_insert', 'U') IS NOT NULL
		DROP TABLE #temp_insert

		CREATE TABLE #temp_stg
		(
			call_ID int NOT NULL,
			rownum int,
			segmented_transcribed_JSON nvarchar(max)
		)
		WITH
		(
			DISTRIBUTION = HASH (call_ID),
			CLUSTERED INDEX (call_ID)
		)
		
		CREATE TABLE #temp_insert
		(
			call_ID int NOT NULL,
			RecognitionStatus NVARCHAR(50),
			ChannelNumber INT,
			SpeakerId INT,
			Offset int,
			Duration NVARCHAR(50),
			OffsetInSeconds float,
			DurationInSeconds float,
    		--NBest_Words NVARCHAR(max),
			Confidence NVARCHAR(50),
			Lexical NVARCHAR(max),
			ITN NVARCHAR(max),
			MaskedITN NVARCHAR(max),
			Display NVARCHAR(max),
			Sentiment_Negative FLOAT,
			Sentiment_Neutral FLOAT,
			Sentiment_Positive FLOAT,
            Words nvarchar(max)
		)
		WITH
		(
			DISTRIBUTION = HASH (call_ID),
			CLUSTERED INDEX (call_ID)
		)
		
		INSERT INTO #temp_stg (call_ID, segmented_transcribed_JSON,rownum)
		SELECT A.call_ID, A.segmented_transcribed_JSON, ROW_NUMBER() OVER(ORDER BY A.call_ID)  FROM [Staging_Insights_JSON] as A;
		
		--select * from #temp_stg
		--Find the highest number to start with
		DECLARE @countVariable INT = (SELECT MAX(rownum) FROM #temp_stg);
		DECLARE @ROW INT;

		-- Loop true your data until you hit 0
		WHILE (@countVariable != 0)
		BEGIN
			SELECT @ROW = rownum
			FROM #temp_stg
			WHERE rownum = @countVariable
			ORDER BY rownum DESC

			DECLARE @jsonVariable NVARCHAR(MAX);
			SELECT @jsonVariable=[segmented_transcribed_JSON] from #temp_stg where rownum = @countVariable;

			DECLARE @callID int

			  SELECT @callID=call_ID FROM #temp_stg WHERE rownum = @countVariable;

			  INSERT INTO #temp_insert (call_ID,RecognitionStatus,ChannelNumber,SpeakerId,Offset,Duration,OffsetInSeconds,DurationInSeconds,
										Confidence,Lexical,ITN,MaskedITN,Display,Words,Sentiment_Negative,Sentiment_Neutral,Sentiment_Positive)
			  SELECT  @callID,RecognitionStatus,ChannelNumber,SpeakerId,Offset,Duration,OffsetInSeconds,DurationInSeconds,
										Confidence,Lexical,ITN,MaskedITN,Display,Words,Sentiment_Negative,Sentiment_Neutral,Sentiment_Positive
				FROM OPENJSON(@jsonVariable)
				  WITH (
							RecognitionStatus NVARCHAR(50) '$.RecognitionStatus',
							ChannelNumber INT '$.ChannelNumber',
							SpeakerId INT '$.SpeakerId',
							Offset INT '$.Offset',
						    Duration NVARCHAR(50) '$.Duration',
							OffsetInSeconds float '$.OffsetInSeconds',
							DurationInSeconds float '$.DurationInSeconds',
    
							NBest_Words NVARCHAR(max) '$.NBest' AS JSON
						) as Level1
						Cross Apply openjson(Level1.NBest_Words)
							With (
										  Confidence NVARCHAR(50) '$.Confidence',
										  Lexical NVARCHAR(max) '$.Lexical',
										  ITN NVARCHAR(max) '$.ITN',
										  MaskedITN NVARCHAR(max) '$.MaskedITN',
										  Display NVARCHAR(max) '$.Display',
										  Words nvarchar(max) '$.Words' as json,
										  Sentiment NVARCHAR(max) '$.Sentiment' as json
										  ) as Level2
										  Cross Apply openjson(Level2.Sentiment)
											with(
													Sentiment_Negative float '$.Negative',
													Sentiment_Neutral float '$.Neutral',
													Sentiment_Positive float '$.Positive'
												) as Level3
			-- SET your counter to -1
			SET @countVariable = @ROW -1
		END
		
		
		INSERT INTO Fact_Audio_Insights(Call_ID,SpeakerId,StartTime,EndTime,Duration,Lexical,Display,Confidence,Sentiment_Positive,Sentiment_Neutral,Sentiment_Negative,ChannelNumber,Words,created_date,created_by,modified_date,modified_by)
		SELECT distinct call_ID,SpeakerId,OffsetInSeconds,OffsetInSeconds+DurationInSeconds,DurationInSeconds,Lexical,Display,Confidence,Sentiment_Positive,Sentiment_Neutral,Sentiment_Negative,ChannelNumber,Words,getdate(),'system',getdate(),'system' from #temp_insert


		DELETE from [Staging_Insights_JSON] where call_ID in (select call_id from Fact_Audio_Insights)
		UPDATE Fact_Audio_Processed
			SET insights_processed=1 
			WHERE call_ID in (select call_ID from #temp_insert)

		DROP TABLE #temp_stg
		DROP TABLE #temp_insert
END
