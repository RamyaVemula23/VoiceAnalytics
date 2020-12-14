DECLARE @jsonVariable NVARCHAR(MAX);
Select @jsonVariable=[segmented_transcribed_JSON] from Staging_Insights_JSON_Bkp;

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
    NBest NVARCHAR(50) '$.NBest'
  );

[{"RecognitionStatus":"Success","ChannelNumber":"","SpeakerId":"2","Offset":14000000,"Duration":29400000,"OffsetInSeconds":1.4,"DurationInSeconds":2.94,"NBest":[{"Confidence":0.9404777,"Lexical":"welcome to hdfc life my name is sky how may i help you","ITN":"Welcome to Hdfc life my name is sky how may I help you","MaskedITN":"Welcome to HDFC life my name is Sky how may I help you","Display":"Welcome to HDFC life my name is Sky how may I help you.","Sentiment":"","Words":[{"Word":"welcome","Offset":14000000,"Duration":3600000,"OffsetInSeconds":1.4,"DurationInSeconds":0.36},{"Word":"to","Offset":17600000,"Duration":1200000,"OffsetInSeconds":1.76,"DurationInSeconds":0.12},{"Word":"hdfc","Offset":18800000,"Duration":5000000,"OffsetInSeconds":1.88,"DurationInSeconds":0.5},{"Word":"life","Offset":23800000,"Duration":3200000,"OffsetInSeconds":2.38,"DurationInSeconds":0.32},{"Word":"my","Offset":27000000,"Duration":1500000,"OffsetInSeconds":2.7,"DurationInSeconds":0.15},{"Word":"name","Offset":28500000,"Duration":1900000,"OffsetInSeconds":2.85,"DurationInSeconds":0.19},{"Word":"is","Offset":30400000,"Duration":1000000,"OffsetInSeconds":3.04,"DurationInSeconds":0.1},{"Word":"sky","Offset":31400000,"Duration":3000000,"OffsetInSeconds":3.14,"DurationInSeconds":0.3},{"Word":"how","Offset":34400000,"Duration":2400000,"OffsetInSeconds":3.44,"DurationInSeconds":0.24},{"Word":"may","Offset":36800000,"Duration":1400000,"OffsetInSeconds":3.68,"DurationInSeconds":0.14},{"Word":"i","Offset":38200000,"Duration":400000,"OffsetInSeconds":3.82,"DurationInSeconds":0.04},{"Word":"help","Offset":38600000,"Duration":2600000,"OffsetInSeconds":3.86,"DurationInSeconds":0.26},{"Word":"you","Offset":41200000,"Duration":2200000,"OffsetInSeconds":4.12,"DurationInSeconds":0.22}]}]}]