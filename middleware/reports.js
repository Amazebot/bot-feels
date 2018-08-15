// Keep Reports Private 🙉
module.exports = (b, next, done) => {
  if (
    b.getBranch('feelings-report') &&
    (b.message.user.room.type !== 'p' || b.message.user.name !== 'admin')
  ) {
    b.finish()
    done()
  } else {
    next()
  }
}
