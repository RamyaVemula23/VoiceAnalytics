-- ===========================================================
-- Create Table SAAB_ML_MASTER_SCRIPT_ADHERANCE_DM 
-- ===========================================================
/****** 
Object:  Table [dbo].[SAAB_ML_MASTER_SCRIPT_ADHERANCE_DM]    
Script Date: 1/28/2020 9:17:09 PM 
Created By: Partha shree Rai 
Description:  Stores script adherance related information wrt domain
******/


IF OBJECT_ID('[dbo].[SAAB_ML_MASTER_SCRIPT_ADHERANCE_DM]', 'U') IS NOT NULL
    DROP TABLE [dbo].[SAAB_ML_MASTER_SCRIPT_ADHERANCE_DM]
GO

CREATE TABLE [dbo].[SAAB_ML_MASTER_SCRIPT_ADHERANCE_DM]
(
    [MASTER_ID] [int]  NOT NULL,
	[DOMAIN_ID] [int]  NOT NULL,
	[SCRIPT_ID] [int]  NOT NULL,
	[SCRIPT_TYPE] [nvarchar] (50) NOT NULL,
	[KEYWORDS] [nvarchar] (max) NOT NULL,
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



