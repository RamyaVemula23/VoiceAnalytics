/****** Object:  StoredProcedure [dbo].[SP_INSERT_SCRIPTADHERANCE]    Script Date: 2/20/2020 5:58:51 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROC [dbo].[SP_INSERT_SCRIPTADHERANCE] @result_id [INT],@domain_id [INT],@script_id [INT],@call_id [BIGINT],@score [float] AS
	DECLARE @created_date datetime=getdate(), @created_by varchar(20) = 'system', @updated_date datetime=getdate(), 
	@updated_by varchar(20) = 'system'

	INSERT INTO [dbo].[SAAB_ML_SCRIPT_ADHERANCE_FT] (RESULT_ID, DOMAIN_ID, SCRIPT_ID, CALL_ID , SCORE , CREATED_DATE, 
	CREATED_BY, UPDATED_DATE, UPDATED_BY)

	VALUES (@result_id, @domain_id, @script_id , @call_id , @score , @created_date, @created_by, @updated_date, 
	@updated_by);