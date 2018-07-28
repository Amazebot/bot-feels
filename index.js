const bot = require('bbot')
bot.adapters.language = require('bbot-understand-watson-tone').use(bot)

bot.load().then(() => {
  bot.listenDirect(/(\bhello\b)|(\bhi\b)|(\bhey\b)/i, (b) => {
    return b.respondVia('react', ':wave:')
  }, { id: 'greeting' })

  bot.listenText(/how do we feel/, async (b) => {
    if (b.bot.adapters.storage) {
      const states = await b.bot.find('states', {})
      const emojis = states
        .filter((b) => b.listeners.find(l => l.id === 'sentiment'))
        .map((b) => b.envelopes[0].strings)
      console.log(emojis)
      if (emojis.length) await b.respond(emojis.join(' '))
    }
    b.finish()
  }, { id: 'feelings-report' })

  bot.understandText({ sentiment: { score: -1, operator: 'gte' } }, async (b) => {
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

  bot.understandText({ tone: { score: 0 } }, async (b) => {
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
    console.log('\n\nresponding with ' + b.envelopes[0].strings)
    console.log(b.message.user.room.type)
    console.log(b.getListener('feelings-report'), '\n\n')
    if (b.getListener('feelings-report') && b.message.user.room.type !== 'p') {
      b.finish()
      done()
    } else {
      next()
    }
  })

  bot.start()
})
