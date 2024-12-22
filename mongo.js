require('dotenv').config()
const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

mongoose.set('strictQuery',false)

const phoneSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minLength: 3
  },

  number: {
    type: String,
    required: true,
    validate: {
      validator(v) {
        return /[0-9]{2,3}-[0-9]{5,}/.test(v)
      }
    },
    minLength: 8
  }
})

const Phone = mongoose.model('Phone', phoneSchema)

mongoose.connect(url)

function fetchAll() {
  return Phone.find({})
}

function createNewPhone(newPhone) {
  let phone = new Phone(newPhone)

  return Phone.find({ name: newPhone.name })
    .then(found => {
      if (found.length === 0) {
        return phone.save()
      } else {
        return Promise.reject('Error name already in the phonebook')
      }
    })
}

function fetchPhone(id) {
  return Phone.findById(id)
}

function deletePhone(id) {
  return Phone.findByIdAndDelete(id)
}

function updatePhone(id, newPhone) {
  return Phone.findByIdAndUpdate(id, newPhone, { new: true, runValidators: true })
}

exports.fetchAll = fetchAll
exports.createNewPhone = createNewPhone
exports.fetchPhone = fetchPhone
exports.deletePhone = deletePhone
exports.updatePhone = updatePhone