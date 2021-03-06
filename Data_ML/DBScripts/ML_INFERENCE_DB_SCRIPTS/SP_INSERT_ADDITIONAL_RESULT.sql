/****** Object:  StoredProcedure [dbo].[SP_INSERT_ADDITIONAL_RESULT]    Script Date: 2/20/2020 6:11:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROC [dbo].[SP_INSERT_ADDITIONAL_RESULT] @result_id [INT],@domain_id [INT],@call_id [BIGINT],@has_escalation [BIT],@has_threat [BIT] AS
	DECLARE @created_date datetime=getdate(), @created_by varchar(20) = 'system', @updated_date datetime=getdate(), 
	@updated_by varchar(20) = 'system', @call_timestamp DATETIME=NULL, @aht FLOAT=NULL

	INSERT INTO [dbo].[SAAB_ML_ADDITIONAL_RESULT_FT] (RESULT_ID, DOMAIN_ID, CALL_ID, AHT, HAS_ESCALATION, HAS_THREAT, 
	CALL_TIMESTAMP, CREATED_DATE, CREATED_BY, UPDATED_DATE, UPDATED_BY)

	VALUES (@result_id, @domain_id, @call_id, @aht, @has_escalation, @has_threat, @call_timestamp, 
	@created_date, @created_by, @updated_date, @updated_by);