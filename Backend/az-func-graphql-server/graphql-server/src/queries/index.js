const { totalCallTypes } = require('./callAnalytics/callTypes');
const { totalCallTopics } = require('./callAnalytics/callTopics');
const { total_Threats_Esc_Calls } = require('./callAnalytics/Threats_Esc_Calls')
const { totalScriptAdherence } = require('./callAnalytics/scriptAdherence')
const { totalTextSentiment } = require('./callAnalytics/textSentiment')
const { totalWordCloud } = require('./callAnalytics/wordCloud')

const queries = { ...totalCallTypes, ...totalCallTopics, ...total_Threats_Esc_Calls, ...totalScriptAdherence, ...totalTextSentiment, ...totalWordCloud };

module.exports = { queries };