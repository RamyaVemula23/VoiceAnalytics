/****** Object:  StoredProcedure [dbo].[SP_INSERT_SENTIMENTS]    Script Date: 2/20/2020 5:59:07 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROC [dbo].[SP_INSERT_SENTIMENTS] @result_id [INT],@call_id [BIGINT],@domain_id [INT],@sentiment_id [INT],@sentiment_score [float] AS
DECLARE @created_date datetime=getdate(),@created_by varchar(20) = 'system',@updated_date datetime=getdate(),@updated_by varchar(20) = 'system'
INSERT INTO [dbo].[SAAB_ML_SENTIMENTS_FT] (RESULT_ID, CALL_ID, DOMAIN_ID, SENTIMENT_ID, SENTIMENT_SCORE,CREATED_DATE, CREATED_BY, UPDATED_DATE, UPDATED_BY)
VALUES (@result_id, @call_id, @domain_id, @sentiment_id, @sentiment_score,@created_date, @created_by, @updated_date, @updated_by);