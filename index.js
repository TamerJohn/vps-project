require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const { fetchAll, createNewPhone, fetchPhone, deletePhone, updatePhone } = require('./mongo.js')

// const requestLogger = (request, response, next) => {
//   console.log('Method:', request.method)
//   console.log('Path:  ', request.path)
//   console.log('Body:  ', request.body)
//   console.log('---')
//   next()
// }

app.use(express.json())
app.use(morgan((tokens, req, res) => {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
  ].join('-')
}))
app.use(cors())
app.use(express.static('dist'))

app.get('/api/persons', (request, response) => {
  fetchAll()
    .then(allPersons => {
      response.json(allPersons)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
  let id = request.params.id
  fetchPhone(id)
    .then(foundPhone => {
      if (foundPhone) {
        response.json(foundPhone)
      } else {
        response.status(404).send({ error: 'could not find phonebook record with given id' })
      }
    })
    .catch(next)
})

app.get('/info', (request, response) => {
  fetchAll().then(phones => {
    let now = new Date()
    response.send(
      `<p>
        Phonebook has info of ${phones.length} people
        <br/>
        ${now.toString()}
      </p>`
    )
  })
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  let newPhone = {
    name: body.name,
    number: body.number,
  }

  createNewPhone(newPhone)
    .then(returnedPhone => {
      response.json(returnedPhone)
    })
    .catch(next)
})

app.put('/api/persons/:id', (request, response, next) => {
  let id = request.params.id
  let { name, number } = request.body

  updatePhone(id, { name, number })
    .then(newPhone => {
      response.json(newPhone)
    })
    .catch(next)
})


app.delete('/api/persons/:id', (request, response, next) => {
  let id = request.params.id

  deletePhone(id)
    .then(() => {
      response.status(204).end()
    })
    .catch(next)
})

const unkownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unkown endpoint' })
}

app.use(unkownEndpoint)

const errorHandler = (error, request, response, next) => {
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformed id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT =  process.env.PORT || 3001
app.listen(PORT , () => {
  console.log('Server running on ' + PORT)
})

