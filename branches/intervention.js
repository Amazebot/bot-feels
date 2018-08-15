const scene = require('./scene')
const catUrl = 'https://cataas.com/cat/says/R%20U%20OK%3F?width=400'

// Shortcut to path handlers for user ID 📨
// const path = (b) => scene.path(b.message.user.id)

// Initiate care to resolve negative sentiment 💌
module.exports = async (b) => {
  const user = b.bot.userById(b.message.user.id)
  user.intervened = new Date()
  // const catCheck = await b.bot.getRequest(catUrl)
  b.respondEnvelope().payload.attach({ image: catUrl })
  b.respond()
}
