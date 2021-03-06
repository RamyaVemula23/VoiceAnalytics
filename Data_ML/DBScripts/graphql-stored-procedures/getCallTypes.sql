/****** Object:  StoredProcedure [dbo].[getCallTypes]    Script Date: 2/25/2020 11:20:07 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROC [dbo].[getCallTypes] @startDate [Date],@endDate [Date] AS
begin
	declare @rows int
	select @rows = count(1) from dbo.SAAB_ML_CALLTYPES_FT c1
					INNER JOIN
					[dbo].[SAAB_MASTER_CALL_METADATA] meta
					ON
					c1.Call_ID = meta.Call_ID
					WHERE
					meta.CallStartDateTime BETWEEN @startDate AND @endDate;
	--print @rows
	select c1.CALLTYPE_ID as ID,c2.CallType, round((count(c1.CALLTYPE_ID)/CONVERT(float,@rows))*100,2) as Score
	from dbo.SAAB_ML_CALLTYPES_FT c1 inner join [dbo].[SAAB_ML_MASTER_CALLTYPES_DM] c2
	on c2.CALLTYPE_ID=c1.CALLTYPE_ID
	INNER JOIN
	[dbo].[SAAB_MASTER_CALL_METADATA] meta
	ON
	c1.Call_ID = meta.Call_ID
	WHERE
	meta.CallStartDateTime BETWEEN @startDate AND @endDate
	group by c1.CALLTYPE_ID,c2.CallType;
end