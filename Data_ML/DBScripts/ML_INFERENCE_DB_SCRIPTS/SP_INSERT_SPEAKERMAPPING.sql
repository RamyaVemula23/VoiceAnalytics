/****** Object:  StoredProcedure [dbo].[SP_INSERT_SPEAKERMAPPING]    Script Date: 22-02-2020 10:45:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROC [dbo].[SP_INSERT_SPEAKERMAPPING] @result_id [INT],@call_id [BIGINT],@domain_id [INT],@speaker_id [INT],@label [nvarchar](20) AS
	DECLARE @created_date datetime=getdate(), @created_by varchar(20) = 'system', @updated_date datetime=getdate(), 
	@updated_by varchar(20) = 'system'

	INSERT INTO [dbo].[SAAB_ML_SPEAKER_MAPPING_FT] (RESULT_ID, CALL_ID, DOMAIN_ID, SPEAKER_ID , "LABEL" , CREATED_DATE, 
	CREATED_BY, UPDATED_DATE, UPDATED_BY)

	VALUES (@result_id, @call_id,  @domain_id, @speaker_id , @label , @created_date, @created_by, @updated_date, 
	@updated_by);