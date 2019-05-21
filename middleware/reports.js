// Keep Reports Private 🙉
module.exports = (b, next, done) => {
  if (
    !!b.getBranch('feelings-report') &&
    b.message.user.name !== 'admin'
  ) {
    b.bot.logger.warn(`[feels] feelings report denied ${b.message.user.name}`)
    b.finish()
    done()
  } else {
    next()
  }
}
