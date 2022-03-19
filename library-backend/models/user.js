const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    minlength: 4,
  },
  passwordHash: String,
  favoriteGenre: String,
})

schema.set('toJSON', {
  transform: (document, returnedObject) => {
    delete returnedObject.passwordHash
  },
})

module.exports = mongoose.model('User', schema)
