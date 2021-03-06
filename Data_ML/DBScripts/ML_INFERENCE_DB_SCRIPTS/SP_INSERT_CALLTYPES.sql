/****** Object:  StoredProcedure [dbo].[SP_INSERT_CALLTYPES]    Script Date: 2/20/2020 6:08:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROC [dbo].[SP_INSERT_CALLTYPES] @master_id [INT],@domain_id [INT],@calltype_id [INT],@call_id [BIGINT] AS
	DECLARE @created_date datetime=getdate(), @created_by varchar(20) = 'system', @updated_date datetime=getdate(), 
	@updated_by varchar(20) = 'system', @corrected_calltype_id int=NULL, @calltype_score FLOAT=NULL

	INSERT INTO [dbo].[SAAB_ML_CALLTYPES_FT] (MASTER_ID, DOMAIN_ID, CALLTYPE_ID, CALL_ID, CALLTYPE_SCORE, 
	CREATED_DATE, CREATED_BY, UPDATED_DATE, UPDATED_BY, CORRECTED_CALLTYPE_ID)

	VALUES (@master_id, @domain_id, @calltype_id, @call_id, @calltype_score, @created_date, @created_by, 
	@updated_date, @updated_by, @corrected_calltype_id);