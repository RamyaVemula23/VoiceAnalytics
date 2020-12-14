-- ===========================================================
-- Create Table SAAB_ML_WORDCOUNT_FT 
-- ===========================================================
/****** 
Object:  Table [dbo].[SAAB_ML_WORDCOUNT_FT]    
Script Date: 1/29/2020 9:17:09 PM 
Created By: Partha shree Rai 
Description:  Stores speaker mappings for each call 
******/


IF OBJECT_ID('[dbo].[SAAB_ML_WORDCOUNT_FT]', 'U') IS NOT NULL
    DROP TABLE [dbo].[SAAB_ML_WORDCOUNT_FT]
GO

CREATE TABLE [dbo].[SAAB_ML_WORDCOUNT_FT]
(
    [RESULT_ID] [int]  NOT NULL,	
	[CALL_ID] [bigint]  NOT NULL,
	[DOMAIN_ID] [int]  NOT NULL,
	[SPEAKER_TYPE] [nvarchar] (20)  NULL,
	[TRANSCRIPT] [nvarchar] (max) NULL,
	[TRANSCRIPT_TYPE] [nvarchar] (20)  NULL,
	[CREATED_DATE] [datetime] NOT NULL,
	[CREATED_BY] [nvarchar](50) NOT NULL,
	[UPDATED_DATE] [datetime] NULL,
	[UPDATED_BY] [nvarchar](50) NULL
)
WITH
(
    DISTRIBUTION = HASH ([RESULT_ID]),
	CLUSTERED INDEX
	(
		[RESULT_ID] ASC
	)
)

GO