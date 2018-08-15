// Remember (last 5) Sentiment 🧠
module.exports = async (b) => {
  const user = b.bot.userById(b.message.user.id)
  const maxSentiments = 5
  for (let sentiment of b.match.sentiment) {
    if (!user.sentiments) user.sentiments = []
    user.sentiments.push(sentiment.score)
    if (user.sentiments.length > maxSentiments) user.sentiments.shift()
  }
}
