/****** Object:  StoredProcedure [dbo].[getTextSentiment]    Script Date: 2/25/2020 11:24:28 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROC [dbo].[getTextSentiment] @startDate [Date],@endDate [Date] AS 
select c2.CALLTYPE, c1.CALLTYPE_ID, c3.SENTIMENT_SCORE, meta.CallStartDateTime from [dbo].[SAAB_ML_CALLTYPES_FT] c1 inner join [dbo].[SAAB_ML_MASTER_CALLTYPES_DM] c2
on c1.CALLTYPE_ID=c2.CALLTYPE_ID
INNER JOIN [dbo].[SAAB_ML_SENTIMENTS_FT] c3
on c1.CALL_ID=c3.CALL_ID
INNER JOIN
[dbo].[SAAB_MASTER_CALL_METADATA] meta
ON
c3.Call_ID = meta.Call_ID
WHERE
meta.CallStartDateTime BETWEEN @startDate AND @endDate;