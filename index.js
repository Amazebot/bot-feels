const bot = require('bbot')
const Filter = require('bad-words')
const filter = new Filter()

bot.settings.set('nlu-adapter', 'bbot-watson-tone-nlu')
bot.settings.set('storage-adapter', 'mongo')

// Ignore all profanity, warn on consecutive cussing 🙊
bot.hearMiddleware(async (b, next, done) => {
  if (filter.isProfane(b.message.toString())) {
    const user = bot.userById(b.message.user.id)
    const timeToWarn = 60 * 60 * 1000 // 1hr in milliseconds
    const now = new Date()
    if (!user.warned || ((now - user.warned) > timeToWarn)) {
      bot.logger.warn(`${user.name} bad language warning issued to ${user.name}`)
      user.warned = now
      await b.respond(`Please mind your language and take some time to review our [code of conduct](https://www.contributor-covenant.org/version/1/4/code-of-conduct).`)
    } else {
      await b.respondVia('react', ':speak_no_evil:')
    }
    done()
  } else {
    next()
  }
})

// Route user in conversation 💬
bot.hearMiddleware((b, next, done) => {
  const user = bot.userById(b.message.user.id)
  user.hearCount = user.hearCount ? user.hearCount + 1 : 1
  bot.logger.info(`[user] ${JSON.stringify(user)} ${user.hearCount} time heard`)
  next()
})

// Wave Hello 👋
bot.global.text(/(\bhello\b)|(\bhi\b)|(\bhey\b)/i, (b) => {
  return b.respondVia('react', ':wave:')
}, { id: 'greeting' })

// Reflect Sentiment 😆
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

// Reflect Tone 🤔
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

// Report Sentiment 📓
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

// Keep Reports Private 🙉
bot.respondMiddleware((b, next, done) => {
  if (b.getBranch('feelings-report') && b.message.user.room.type !== 'p') {
    b.finish()
    done()
  } else {
    next()
  }
})

// Remember Sentiment 🧠
bot.global.NLU({ sentiment: { score: -1, operator: 'gte' } }, async (b) => {
  const user = bot.userById(b.message.user.id)

  // store last 5 sentiment scores brain
  const maxSentiments = 5
  for (let sentiment of b.match.sentiment) {
    if (!user.sentiments) user.sentiments = []
    user.sentiments.push(sentiment.score)
    if (user.sentiments.length > maxSentiments) user.sentiments.shift()
  }

  // if 3/5 negative sentiment, initiate care 💌
  bot.logger.info(`Intervention check for ${user.name} (${user.sentiments.join(', ')})`)
  if (user.sentiments.filter((score) => score < 0).length >= 1) {
    const timeToIntervene = 60 * 60 * 24 * 1000 // 24hrs in milliseconds
    const now = new Date()
    if (!user.intervened || ((now - user.intervened) > timeToIntervene)) {
      bot.logger.warn(`${user.name} sentiment low, time to intervene`)
      user.intervened = now
    } else {
      bot.logger.warn(`${user.name} sentiment low, last intervention < 24h`)
    }
  }
}, { id: 'sentiment-track', force: true })

bot.start()
