/****** Object:  StoredProcedure [dbo].[getEscalations]    Script Date: 2/25/2020 11:21:29 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROC [dbo].[getEscalations] @startDate [Date],@endDate [Date] AS
select COUNT(*) AS TOTAL_ESCALATIONS 
FROM [dbo].[SAAB_ML_ADDITIONAL_RESULT_FT] c1
INNER JOIN
[dbo].[SAAB_MASTER_CALL_METADATA] meta
ON
c1.Call_ID = meta.Call_ID
WHERE HAS_ESCALATION=1 and  
meta.CallStartDateTime BETWEEN @startDate AND @endDate