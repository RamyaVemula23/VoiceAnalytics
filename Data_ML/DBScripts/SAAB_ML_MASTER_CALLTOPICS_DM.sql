-- ===========================================================
-- Create Table SAAB_ML_MASTER_CALLTOPICS_DM
-- ===========================================================
/****** 
Object:  Table [dbo].[SAAB_ML_MASTER_CALLTOPICS_DM]    
Script Date: 1/28/2020 9:17:09 PM 
Created By: Partha shree Rai 
Description:  Stores call topic related information wrt domain


IF OBJECT_ID('[dbo].[SAAB_ML_MASTER_CALLTOPICS_DM]', 'U') IS NOT NULL
    DROP TABLE [dbo].[SAAB_ML_MASTER_CALLTOPICS_DM]
GO

CREATE TABLE [dbo].[SAAB_ML_MASTER_CALLTOPICS_DM]
(
    [MASTER_ID] [int]  NOT NULL,
	[DOMAIN_ID] [int] NOT NULL,
	[CALLTOPIC_ID] [int] NOT NULL,
	[CALLTOPICS] [nvarchar] (50) NULL,
	[KEYWORDS] [nvarchar] (max) NULL,
	[CREATED_DATE] [datetime] NOT NULL,
	[CREATED_BY] [nvarchar](50) NOT NULL,
	[UPDATED_DATE] [datetime] NULL,
	[UPDATED_BY] [nvarchar](50) NULL
)
WITH
(
    DISTRIBUTION = HASH ([MASTER_ID]),
	CLUSTERED INDEX
	(
		[MASTER_ID] ASC
	)
)
GO



