-- ===========================================================
-- Create Table : Staging_Insights_JSON
-- ===========================================================
IF OBJECT_ID('dbo.Staging_Insights_JSON', 'U') IS NOT NULL
    DROP TABLE dbo.Staging_Insights_JSON
GO

CREATE TABLE Staging_Insights_JSON
(
    call_ID int NOT NULL,
	segmented_transcribed_JSON nvarchar(max)

)
WITH
(
    DISTRIBUTION = HASH (call_ID),
    CLUSTERED INDEX (call_ID)
)
GO