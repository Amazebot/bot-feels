// Reflect Sentiment 😆
module.exports = async (b) => {
  const envelope = b.respondEnvelope()
  for (let sentiment of b.match.sentiment) {
    if (sentiment.score >= 0.75) envelope.write(':laughing:')
    else if (sentiment.score >= 0.50) envelope.write(':grin:')
    else if (sentiment.score >= 0.25) envelope.write(':smiley:')
    else if (sentiment.score > 0) envelope.write(':blush:')
    else if (sentiment.score === 0) envelope.write(':neutral-face:')
    else if (sentiment.score <= -0.75) envelope.write(':sob:')
    else if (sentiment.score <= -0.5) envelope.write(':disappointed:')
    else if (sentiment.score <= -0.25) envelope.write(':frowning:')
    else if (sentiment.score < 0) envelope.write(':unamused:')
  }
  if (envelope.strings) await b.respondVia('react')
}
