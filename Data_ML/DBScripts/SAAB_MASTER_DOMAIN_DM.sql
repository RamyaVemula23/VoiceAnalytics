-- ===========================================================
-- Create Table SAAB_MASTER_DOMAIN_DM
-- ===========================================================
/****** 
Object:  Table [dbo].[SAAB_MASTER_DOMAIN_DM]    
Script Date: 1/28/2020 9:17:09 PM 
Created By: Partha shree Rai 
Description:  Stores domain specific information for a customer which is mapped to other tables
******/


IF OBJECT_ID('[dbo].[SAAB_MASTER_DOMAIN_DM]', 'U') IS NOT NULL
    DROP TABLE [dbo].[SAAB_MASTER_DOMAIN_DM]
GO

CREATE TABLE [dbo].[SAAB_MASTER_DOMAIN_DM]
(
    [MASTER_ID] [int]  NOT NULL,
	[DOMAIN_ID] [int] NOT NULL,
	[DOMAIN_NAME] [nvarchar](50) NULL,
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



