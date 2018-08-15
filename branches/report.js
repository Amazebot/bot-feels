// Report Sentiment 📓
module.exports = async (b) => {
  if (b.bot.adapters.storage) {
    const states = await b.bot.find('states', {})
    const emojis = states
      .filter((b) => b.branches.find(branch => branch.id === 'sentiment'))
      .map((b) => b.envelopes[0].strings)
    if (emojis.length) await b.respond(emojis.join(' '))
  }
  b.finish()
}
