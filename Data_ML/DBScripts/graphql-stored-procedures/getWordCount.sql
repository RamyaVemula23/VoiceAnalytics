/****** Object:  StoredProcedure [dbo].[getWordCount]    Script Date: 2/25/2020 11:27:47 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROC [dbo].[getWordCount] @startDate [Date],@endDate [Date] AS	
	SELECT top 200 VALUE AS Words_Phrases, count(value) AS Frequency from  String_Split(
		(select String_Agg(REPLACE(REPLACE (REPLACE(TRANSCRIPT,''', ''','|'), '[''',''),''']',''),'|') from [dbo].[SAAB_ML_WORDCOUNT_FT] c1
		INNER JOIN
		[dbo].[SAAB_MASTER_CALL_METADATA] meta
		ON
		c1.Call_ID = meta.Call_ID
		WHERE
		meta.CallStartDateTime BETWEEN @startDate AND @endDate
		AND 
		TRANSCRIPT_TYPE = 'Bigrams')
		,'|')
	group by value
	order by frequency desc