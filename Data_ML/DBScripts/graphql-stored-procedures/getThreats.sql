/****** Object:  StoredProcedure [dbo].[getThreats]    Script Date: 2/25/2020 11:25:45 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROC [dbo].[getThreats] @startDate [Date],@endDate [Date] AS
select COUNT(*) AS TOTAL_THREATS FROM dbo.SAAB_ML_ADDITIONAL_RESULT_FT c1
INNER JOIN
	[dbo].[SAAB_MASTER_CALL_METADATA] meta
	ON
	c1.Call_ID = meta.Call_ID
	WHERE HAS_THREAT=1
	AND meta.CallStartDateTime BETWEEN @startDate AND @endDate