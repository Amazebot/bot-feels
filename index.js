const bot = require('bbot')
const scene = require('./scene')

bot.settings.set('nlu-adapter', 'bbot-watson-tone-nlu')
bot.settings.set('storage-adapter', 'mongo')
scene.setup(bot)

bot.global.text(
  /(\bhello\b)|(\bhi\b)|(\bhey\b)/i,
  require('./branches/hello'),
  { id: 'greeting' }
)
bot.global.NLU(
  { sentiment: { score: -1, operator: 'gte' } },
  require('./branches/sentiment'),
  { id: 'sentiment', force: true }
)
bot.global.NLU(
  { tone: { score: 0 } },
  require('./branches/tone'),
  { id: 'tones', force: true }
)
bot.global.direct(
  /how are we/i,
  require('./branches/report'),
  { id: 'feelings-report' }
)
bot.global.NLU(
  { sentiment: { score: -1, operator: 'gte' } },
  require('./branches/remember'),
  { id: 'sentiment-track', force: true }
)
// bot.global.customNLU(
//   require('./matchers/intervention'),
//   require('./branches/intervention'),
//   { id: 'sentiment-intervention', force: true }
// )

bot.hearMiddleware(require('./middleware/profanity'))
bot.respondMiddleware(require('./middleware/reports'))

bot.start()
