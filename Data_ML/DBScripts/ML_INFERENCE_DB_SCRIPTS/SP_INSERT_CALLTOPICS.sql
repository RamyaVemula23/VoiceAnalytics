/****** Object:  StoredProcedure [dbo].[SP_INSERT_CALLTOPICS]    Script Date: 2/20/2020 6:08:57 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROC [dbo].[SP_INSERT_CALLTOPICS] @result_id [INT],@call_id [BIGINT],@domain_id [INT],@callTopic_id [INT],@callTopic_score [FLOAT] AS
	DECLARE @created_date datetime=getdate(), @created_by varchar(20) = 'system', @updated_date datetime=getdate(), @updated_by varchar(20) = 'system'
	INSERT INTO [dbo].[SAAB_ML_CALLTOPICS_FT] (RESULT_ID, CALL_ID, DOMAIN_ID, CALLTOPIC_ID, CALLTOPIC_SCORE, 
	CREATED_DATE, CREATED_BY, UPDATED_DATE, UPDATED_BY)
	VALUES (@result_id, @call_id, @domain_id, @callTopic_id, @callTopic_score, @created_date, @created_by, 
	@updated_date, @updated_by);