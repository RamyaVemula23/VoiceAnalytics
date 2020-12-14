/****** Object:  StoredProcedure [dbo].[insertInFactAudioProcessed]    Script Date: 1/9/2020 7:26:33 PM ******/
DROP PROCEDURE [dbo].[insertInFactAudioProcessed]
GO

/****** Object:  StoredProcedure [dbo].[insertInFactAudioProcessed]    Script Date: 1/9/2020 7:26:33 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE PROC [dbo].[insertInFactAudioProcessed] @call_ID [int],@file_name [varchar](50),@cache_control [varchar](10),@pragma [varchar](10),@expires [int],@api_location [varchar](100),@retry_after [int],@api_server [varchar](100),@operation_location [varchar](100),@api_supported_versions [varchar](30),@x_ratelimit_limit [int],@x_ratelimit_remaining [int],@x_ratelimit_reset [varchar](20),@x_powered_by [varchar](10),@x_content_type_options [varchar](10),@x_frame_options [varchar](20),@strict_transport_security [varchar](50),@run_date [varchar](50),@connection [varchar](10),@content_length [int],@recording_url [nvarchar](max),@results_url [nvarchar](max) AS

Declare @transcription_generated bit = 0, @insights_processed int = 0


    INSERT INTO Fact_Audio_Processed (call_ID,file_name, cache_control, pragma, expires,
api_location, retry_after, api_server, operation_location, api_supported_versions, 
x_ratelimit_limit, x_ratelimit_remaining, x_ratelimit_reset, x_powered_by, x_content_type_options,
x_frame_options, strict_transport_security, run_date, connection, content_length, 
transcription_generated, recording_url, results_url, insights_processed)
    VALUES (@call_ID,@file_name, @cache_control, @pragma, @expires,
@api_location, @retry_after, @api_server, @operation_location, @api_supported_versions, 
@x_ratelimit_limit, @x_ratelimit_remaining, @x_ratelimit_reset, @x_powered_by, @x_content_type_options,
@x_frame_options, @strict_transport_security, @run_date, @connection, @content_length, 
@transcription_generated, @recording_url, @results_url, @insights_processed);




GO


