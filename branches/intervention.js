// const scene = require('./scene')
const imgPath = 'https://raw.githubusercontent.com/Amazebot/bot-feels/master/img/'

// Shortcut to path handlers for user ID 📨
// const path = (b) => scene.path(b.message.user.id)

// Initiate care to resolve negative sentiment 💌
module.exports = async (b) => {
  b.bot.logger.warn(`[feels] running intervention script for ${b.message.user.name}`)
  b.finish()
  const user = b.bot.userById(b.message.user.id)
  user.intervened = new Date()
  const imgNum = Math.floor(Math.random() * Math.floor(9))
  const imgUrl = `${imgPath}RUOK_${imgNum}.jpg`
  await b.respond({
    fallback: 'RUOK.jpg?',
    image: imgUrl
  })
}
