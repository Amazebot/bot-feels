const bot = require('bbot')

// check if 3 of last 5 sentiment negative 😿
module.exports = (message) => {
  const user = bot.userById(message.user.id)
  bot.logger.info(`Intervention check for ${user.name} (${user.sentiments.join(', ')})`)
  if (user.sentiments.filter((score) => score < 0).length >= 1) {
    const timeToIntervene = 60 * 60 * 24 * 1000 // 24hrs in milliseconds
    const now = new Date()
    if (!user.intervened || ((now - user.intervened) > timeToIntervene)) {
      bot.logger.warn(`${user.name} sentiment low, time to intervene`)
      return true
    } else {
      bot.logger.warn(`${user.name} sentiment low, last intervention < 24h`)
    }
  }
  return false
}
