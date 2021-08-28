// Reflect Tone 🤔
module.exports = async (b) => {
  const envelope = b.respondEnvelope()
  for (let tone of b.match.tone) {
    switch (tone.id) {
      case 'anger': envelope.write(':rage:'); break
      case 'disgust': envelope.write(':confounded:'); break
      case 'fear': envelope.write(':fearful:'); break
      case 'sadness': envelope.write(':disappointed:'); break
      case 'joy': envelope.write(':heart-eyes:'); break
      case 'analytical': envelope.write(':thinking:'); break
      case 'confident': envelope.write(':sunglasses:'); break
      case 'tentative': envelope.write(':eye-roll:'); break
    }
  }
  if (envelope.strings) await b.respondVia('react')
}
