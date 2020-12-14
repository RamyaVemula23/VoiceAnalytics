-- ===========================================================
-- Create Table SAAB_ML_MASTER_CALLTYPES_DM
-- ===========================================================
/****** 
Object:  Table [dbo].[SAAB_ML_MASTER_CALLTYPES_DM]    
Script Date: 1/28/2020 9:17:09 PM 
Created By: Partha shree Rai 
Description:  Stores call type related information wrt domain 
******/


IF OBJECT_ID('[dbo].[SAAB_ML_MASTER_CALLTYPES_DM]', 'U') IS NOT NULL
    DROP TABLE [dbo].[SAAB_ML_MASTER_CALLTYPES_DM]
GO

CREATE TABLE [dbo].[SAAB_ML_MASTER_CALLTYPES_DM]
(
    [RESULT_ID] [int]  NOT NULL,
	[DOMAIN_ID] [int] NOT NULL,
	[CALLTYPE_ID] [int] NOT NULL,
	[CALLTYPE] [nvarchar](50) NULL,
	[KEYWORDS] [nvarchar](max) NULL,
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



