const Filter = require('bad-words')
const filter = new Filter()

// Ignore all profanity, warn on consecutive cussing 🙊
module.exports = async (b, next, done) => {
  if (filter.isProfane(b.message.toString())) {
    const user = b.bot.userById(b.message.user.id)
    const timeToWarn = 60 * 60 * 1000 // 1hr in milliseconds
    const now = new Date()
    if (!user.warned || ((now - user.warned) > timeToWarn)) {
      b.bot.logger.warn(`${user.name} bad language warning issued to ${user.name}`)
      user.warned = now
      await b.respond(`Please mind your language and take some time to review our [code of conduct](https://www.contributor-covenant.org/version/1/4/code-of-conduct).`)
    } else {
      await b.respondVia('react', ':speak_no_evil:')
    }
    done()
  } else {
    next()
  }
}
