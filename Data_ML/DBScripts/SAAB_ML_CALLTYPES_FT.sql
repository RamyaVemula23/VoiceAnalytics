-- ===========================================================
-- Create Table SAAB_ML_CALLTYPES_FT
-- ===========================================================
/****** 
Object:  Table [dbo].[SAAB_ML_CALLTYPES_FT]    
Script Date: 1/28/2020 9:17:09 PM 
Created By: Partha shree Rai 
Description:  Stores call type related information wrt call id 
******/


IF OBJECT_ID('[dbo].[SAAB_ML_CALLTYPES_FT]', 'U') IS NOT NULL
    DROP TABLE [dbo].[SAAB_ML_CALLTYPES_FT]
GO

CREATE TABLE [dbo].[SAAB_ML_CALLTYPES_FT]
(
    [MASTER_ID] [int]  NOT NULL,
	[DOMAIN_ID] [int] NOT NULL,
	[CALLTYPE_ID] [int] NOT NULL,
	[CALL_ID] [bigint] NOT NULL,
	[CALLTYPE_SCORE] [float] NULL,
	[CREATED_DATE] [datetime] NOT NULL,
	[CREATED_BY] [nvarchar](50) NOT NULL,
	[CORRECTED_CALLTYPE_ID] [int] NULL,
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

