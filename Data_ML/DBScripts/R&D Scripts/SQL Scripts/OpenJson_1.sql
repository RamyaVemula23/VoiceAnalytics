DECLARE @jsonVariable NVARCHAR(MAX);
Select @jsonVariable=[segmented_transcribed_JSON] from Staging_Insights_JSON_Bkp where [call_ID]=2;

select @jsonVariable

SELECT *
FROM OPENJSON(@jsonVariable)
  WITH (
    RecognitionStatus NVARCHAR(50) '$.RecognitionStatus',
    ChannelNumber NVARCHAR(50) '$.ChannelNumber',
    SpeakerId INT '$.SpeakerId',
    Offset NVARCHAR(50) '$.Offset',
	 Duration NVARCHAR(50) '$.Duration',
    OffsetInSeconds NVARCHAR(50) '$.OffsetInSeconds',
    DurationInSeconds NVARCHAR(50) '$.DurationInSeconds',
    Confidence NVARCHAR(50) '$.NBest.Confidence',
	 Lexical NVARCHAR(50) '$.NBest.Lexical',
    ITN NVARCHAR(50) '$.NBest.ITN',
    MaskedITN NVARCHAR(50) '$.NBest.MaskedITN',
    NBest_Words NVARCHAR(50) '$.NBest.Words.Word'
  );