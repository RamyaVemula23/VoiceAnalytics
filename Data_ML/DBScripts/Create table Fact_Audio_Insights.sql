-- ===========================================================
-- Create Table : SAAB_CALL_OVERVIEW_BKP
-- ===========================================================
IF OBJECT_ID('dbo.Fact_Audio_Insights', 'U') IS NOT NULL
    DROP TABLE dbo.Fact_Audio_Insights
GO

CREATE TABLE Fact_Audio_Insights
		(
			Call_ID INT NOT NULL,
			SpeakerId INT,
			StartTime FLOAT,
			EndTime FLOAT,
			Duration FLOAT,
			Lexical NVARCHAR(max),
			Display NVARCHAR (max),
			Confidence NVARCHAR(50),
			Sentiment_Positive NVARCHAR(50),
			Sentiment_Negative NVARCHAR(50),
			Sentiment_Neutral NVARCHAR(50),
			ChannelNumber INT,
			Words nvarchar(max)
		)
		WITH
		(
			DISTRIBUTION = HASH (Call_ID),
			CLUSTERED INDEX (Call_ID)
		)
		GO
