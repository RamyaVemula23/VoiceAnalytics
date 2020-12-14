import { gql } from "apollo-boost";

export function CALL_TYPES(startDay, endDay) {
  return gql`
  query {
    getCallTypes(startDate:"${startDay}", endDate:"${endDay}") {
      response {
        ID
        CallType
        Score
      }
    }
  }
`;}

export function CALL_TOPICS(startDay, endDay) { 
  return gql`
  query {
    getCallTopics(startDate:"${startDay}", endDate:"${endDay}") {
      response {
        ID
        CallTopic
        Score
      }
    }
  }
`;}

export function KPI_RETRIEVES(startDay, endDay) {
  return gql`
  query {
    getThreats_Esc_Calls(startDate:"${startDay}", endDate:"${endDay}") {
      response {
        NoOfThreatCalls
        NoOfEscalations
        TotalNoOfCalls
      }
    }
  }
`;}

export function SCRIPT_ADHERENCE(startDay, endDay) {
  return gql`
  query {
    getScriptAdherence(startDate:"${startDay}", endDate:"${endDay}") {
      response {
        ID
        ScriptType
        Score
      }
    }
  }
`;}

export function SENTIMENT_SCORE(startDay, endDay) {
  return gql`
  query {
    getTextSentiment(startDate:"${startDay}", endDate:"${endDay}") {
      response {
        callTypeId
        callType
        sentimentScore
        dateTime
      }
    }
  }
`;}

export function WORD_CLOUD(startDay, endDay) {
  return gql`
  query {
    getWordCloud(startDate:"${startDay}", endDate:"${endDay}") {
      response {
        Words
        Frequency
      }
    }
  }
`;}
