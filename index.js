const bot = require('bbot')

bot.global.text(/(\bhello\b)|(\bhi\b)|(\bhey\b)/i, (b) => {
  return b.respondVia('react', ':wave:')
}, { id: 'greeting' })

bot.global.text(/how do we feel/, async (b) => {
  if (b.bot.adapters.storage) {
    const states = await b.bot.find('states', {})
    const emojis = states
      .filter((b) => b.branches.find(branch => branch.id === 'sentiment'))
      .map((b) => b.envelopes[0].strings)
    if (emojis.length) await b.respond(emojis.join(' '))
  }
  b.finish()
}, { id: 'feelings-report' })

bot.global.NLU({ sentiment: { score: -1, operator: 'gte' } }, async (b) => {
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
}, { id: 'sentiment', force: true })

bot.global.NLU({ tone: { score: 0 } }, async (b) => {
  const envelope = b.respondEnvelope()
  for (let tone of b.match.tone) {
    switch (tone.id) {
      case 'anger': envelope.write(':rage:'); break
      case 'disgust': envelope.write(':confounded:'); break
      case 'fear': envelope.write(':fearful:'); break
      case 'joy': envelope.write(':heart-eyes:'); break
      case 'sadness': envelope.write(':cry:'); break
      case 'analytical': envelope.write(':monocle:'); break
      case 'confident': envelope.write(':sunglasses:'); break
      case 'tentative': envelope.write(':thinking:'); break
    }
  }
  if (envelope.strings) await b.respondVia('react')
}, { id: 'tones', force: true })

bot.respondMiddleware((b, next, done) => {
  if (b.getBranch('feelings-report') && b.message.user.room.type !== 'p') {
    b.finish()
    done()
  } else {
    next()
  }
})

bot.start()
