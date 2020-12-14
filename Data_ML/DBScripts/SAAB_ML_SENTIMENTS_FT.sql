-- ===========================================================
-- Create Table SAAB_ML_SENTIMENTS_FT
-- ===========================================================
/****** 
Object:  Table [dbo].[SAAB_ML_SENTIMENTS_FT]    
Script Date: 1/28/2020 9:17:09 PM 
Created By: Partha shree Rai 
Description:  Stores sentiment related information wrt call id 
******/


IF OBJECT_ID('[dbo].[SAAB_ML_SENTIMENTS_FT]', 'U') IS NOT NULL
    DROP TABLE [dbo].[SAAB_ML_SENTIMENTS_FT]
GO

CREATE TABLE [dbo].[SAAB_ML_SENTIMENTS_FT]
(
    [RESULT_ID] [int]  NOT NULL,
	[CALL_ID] [bigint] NOT NULL,
	[DOMAIN_ID] [int] NOT NULL,
	[SENTIMENT_ID] [int] NOT NULL,
	[SENTIMENT_SCORE] [float] NULL,
	[CREATED_DATE] [datetime] NOT NULL,
	[CREATED_BY] [nvarchar](50) NOT NULL,
	[UPDATED_DATE] [datetime] NULL,
	[UPDATED_BY] [nvarchar](50) NULL
)
WITH
(
    DISTRIBUTION = HASH ([CALL_ID]),
	CLUSTERED INDEX
	(
		[CALL_ID] ASC
	)
)
GO



