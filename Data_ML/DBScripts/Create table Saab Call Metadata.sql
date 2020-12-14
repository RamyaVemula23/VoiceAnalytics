-- ===========================================================
-- Create Table : SAAB_MASTER_CALL_METADATA
-- ===========================================================
IF OBJECT_ID('dbo.SAAB_MASTER_CALL_METADATA', 'U') IS NOT NULL
    DROP TABLE dbo.SAAB_MASTER_CALL_METADATA
GO

CREATE TABLE SAAB_MASTER_CALL_METADATA
		(
			Call_ID INT NOT NULL,
			CallStartDateTime Datetime,
			CallEndDateTime Datetime,
			CreatedBy nvarchar(50),
			CreatedDate Datetime,
			UpdatedBy nvarchar(50),
			UpdatedDate Datetime
		)
		WITH
		(
			DISTRIBUTION = HASH (Call_ID),
			CLUSTERED INDEX (Call_ID)
		)
		GO
