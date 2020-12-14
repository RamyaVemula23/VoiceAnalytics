/****** Object:  StoredProcedure [dbo].[movedFromInsightsToProcessed]    Script Date: 1/9/2020 6:58:11 PM ******/
DROP PROCEDURE [dbo].[movedFromInsightsToProcessed]
GO

/****** Object:  StoredProcedure [dbo].[movedFromInsightsToProcessed]    Script Date: 1/9/2020 6:58:11 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE PROC [dbo].[movedFromInsightsToProcessed] @audiofileCallID [int] AS
	UPDATE Fact_Audio_Processed SET insights_processed = 2,modified_by='system',modified_date=getdate() WHERE call_ID = @audiofileCallID;
GO


