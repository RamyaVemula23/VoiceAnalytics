-- ===========================================================
-- Create Table : Fact_Audio_Processed
-- ===========================================================
IF OBJECT_ID('dbo.Fact_Audio_Processed', 'U') IS NOT NULL
    DROP TABLE dbo.Fact_Audio_Processed
GO

CREATE TABLE Fact_Audio_Processed
(
    call_ID int NOT NULL,
	file_name varchar(50),
	cache_control varchar(10),
	pragma varchar(10),
	expires int,
	api_location varchar(100),
	retry_after int,
	api_server varchar(100),
	operation_location varchar(100),
	api_supported_versions varchar(30),
	x_ratelimit_limit int,
	x_ratelimit_remaining int,
	x_ratelimit_reset varchar(20),
	x_powered_by varchar(10),
	x_content_type_options varchar(10),
	x_frame_options varchar(20),
	strict_transport_security varchar(50),
	run_date varchar(50),
	connection varchar(10),
	content_length int,
	transcription_generated bit DEFAULT 0,
	recording_url varchar(100),
	results_url varchar(100),
	insights_processed int  DEFAULT 0,
	[transcription_filenames] [nvarchar](max)

)
WITH
(
    DISTRIBUTION = HASH (call_ID),
    CLUSTERED INDEX (call_ID)
)
GO