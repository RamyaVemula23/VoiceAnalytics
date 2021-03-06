/****** Object:  StoredProcedure [dbo].[SP_INSERT_WORDCOUNT]    Script Date: 2/20/2020 6:08:03 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROC [dbo].[SP_INSERT_WORDCOUNT] @result_id [INT],@call_id [BIGINT],@domain_id [INT],@transcript [NVARCHAR](max),@transcript_type [NVARCHAR](20) AS
	DECLARE @created_date datetime=getdate(), @created_by varchar(20) = 'system', @updated_date datetime=getdate(), 
	@speaker_type NVARCHAR(20) = NULL, @updated_by varchar(20) = 'system'

	INSERT INTO [dbo].[SAAB_ML_WORDCOUNT_FT] (RESULT_ID, CALL_ID, DOMAIN_ID, SPEAKER_TYPE, TRANSCRIPT, TRANSCRIPT_TYPE, 
	CREATED_DATE, CREATED_BY, UPDATED_DATE, UPDATED_BY)

	VALUES (@result_id, @call_id, @domain_id, @speaker_type, @transcript, @transcript_type, @created_date, @created_by, 
	@updated_date, @updated_by);