# SAAB Backend features


Call Transcription Function: It is a Azure Function associated with Timer Trigger event
  -This has following functionalities
  1.It receives a token from IssueToken service of speech
  2.It generates SAS uri's for each blob in a container.
  3.With the token from speech issueToken and the SAS uri's ,it makes a call to the transcription api .
