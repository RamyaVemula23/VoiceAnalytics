/****** Object:  StoredProcedure [dbo].[getCallTopics]    Script Date: 2/25/2020 11:18:54 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROC [dbo].[getCallTopics] @startDate [Date],@endDate [Date] AS
begin
	declare @rows int
	select @rows = count(1) from [dbo].[SAAB_ML_CALLTOPICS_FT] c1
					INNER JOIN
					[dbo].[SAAB_MASTER_CALL_METADATA] meta
					ON
					c1.Call_ID = meta.Call_ID
					WHERE
					meta.CallStartDateTime BETWEEN @startDate AND @endDate;
	SELECT c1.CALLTOPIC_ID as ID, c2.CALLTOPICS, round((count(c1.CALLTOPIC_ID)/CONVERT(float,@rows))*100,2) as Score
	FROM [dbo].[SAAB_ML_CALLTOPICS_FT] c1 inner join [dbo].[SAAB_ML_MASTER_CALLTOPICS_DM] c2
	ON c1.CALLTOPIC_ID = c2.CALLTOPIC_ID
	INNER JOIN
	[dbo].[SAAB_MASTER_CALL_METADATA] meta
	ON
	c1.Call_ID = meta.Call_ID
	WHERE
	meta.CallStartDateTime BETWEEN @startDate AND @endDate
	GROUP BY c1.CALLTOPIC_ID, c2.CALLTOPICS
end