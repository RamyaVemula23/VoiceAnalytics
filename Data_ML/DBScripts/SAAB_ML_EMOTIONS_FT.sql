-- ===========================================================
-- Create Table SAAB_ML_EMOTIONS_FT
-- ===========================================================
/****** 
Object:  Table [dbo].[SAAB_ML_EMOTIONS_FT]    
Script Date: 1/28/2020 9:17:09 PM 
Created By: Partha shree Rai 
Description:  Stores emotion related information wrt call id
******/


IF OBJECT_ID('[dbo].[SAAB_ML_EMOTIONS_FT]', 'U') IS NOT NULL
    DROP TABLE [dbo].[SAAB_ML_EMOTIONS_FT]
GO

CREATE TABLE [dbo].[SAAB_ML_EMOTIONS_FT]
(
    [RESULT_ID] [int]  NOT NULL,
	[DOMAIN_ID] [int] NOT NULL,
	[EMOTION_ID] [int] NOT NULL,
	[CALL_ID] [bigint] NOT NULL,
	[EMOTION_SCORE] [float] NULL,
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



