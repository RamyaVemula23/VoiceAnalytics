/****** Object:  StoredProcedure [dbo].[fetchInsightsProcessedRecords]    Script Date: 1/9/2020 7:00:18 PM ******/
DROP PROCEDURE [dbo].[fetchInsightsProcessedRecords]
GO

/****** Object:  StoredProcedure [dbo].[fetchInsightsProcessedRecords]    Script Date: 1/9/2020 7:00:18 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE PROC [dbo].[fetchInsightsProcessedRecords] AS
	SELECT call_ID, [file_name] fileName FROM Fact_Audio_Processed fap WHERE insights_processed = 1;
GO


