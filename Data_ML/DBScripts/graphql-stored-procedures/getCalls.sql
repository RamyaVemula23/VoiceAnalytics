/****** Object:  StoredProcedure [dbo].[getCalls]    Script Date: 2/25/2020 11:15:57 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROC [dbo].[getCalls] @startDate [Date],@endDate [Date] AS
SELECT DISTINCT COUNT (*) AS TOTAL_CALLS FROM dbo.fact_audio_processed fap
INNER JOIN
	[dbo].[SAAB_MASTER_CALL_METADATA] meta
	ON
	fap.Call_ID = meta.Call_ID
	WHERE
	meta.CallStartDateTime BETWEEN @startDate AND @endDate