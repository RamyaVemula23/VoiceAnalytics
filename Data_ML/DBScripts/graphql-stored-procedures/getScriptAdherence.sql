/****** Object:  StoredProcedure [dbo].[getScriptAdherence]    Script Date: 2/25/2020 11:22:52 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROC [dbo].[getScriptAdherence] @startDate [Date],@endDate [Date] AS
select c1.SCRIPT_ID as ID,c2.Script_Type, round(avg(c1.score)*100,2) as Score
from dbo.SAAB_ML_SCRIPT_ADHERANCE_FT c1 inner join [dbo].[SAAB_ML_MASTER_SCRIPT_ADHERANCE_DM] c2
on c2.SCRIPT_ID=c1.SCRIPT_ID 
INNER JOIN
	[dbo].[SAAB_MASTER_CALL_METADATA] meta
	ON
	c1.Call_ID = meta.Call_ID
	WHERE
	meta.CallStartDateTime BETWEEN @startDate AND @endDate
group by c1.SCRIPT_ID,c2.Script_Type ;