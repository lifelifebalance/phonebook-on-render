require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()

app.use(express.static('build'))
app.use(cors())
app.use(express.json())

morgan.token('body', function (req, res) {
    return (
        JSON.stringify(req.body)
    )
})


app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))


///// Routes /////
// Info
app.get('/info', (request, response) => {
    Person.find({}).then(persons => {
        response.send(`<p>Phonebook has ${persons.length} entries</p>
        <p>${new Date()}</p>`)
    })
})

// Get all
app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

// Get by id
app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

// Delete
app.delete('/api/persons/:id', (request, response) => {
    Person.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
})

// Update
app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    const person = {
        name: body.name,
        number: body.number,
    }

    const options = {
        new: true,
        runValidators: true,
    }

    Person.findByIdAndUpdate(request.params.id, person, options)
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})


// Post
app.post('/api/persons', (request, response, next) => {
    const body = request.body



    const person = new Person({
        name: body.name,
        number: body.number,
    })

    person.save()
        .then(savedPerson => {
            response.json(savedPerson)
    })
    .catch(error => next(error))


    // if(persons.map(p => p.name).includes(body.name)) {
    //     return response.status(400).json({
    //         error: 'names must be unique'
    //     })
    // }

})


// Error handling for requests with unknown endpoint
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint'})
}

app.use(unknownEndpoint)


// Error handling bad requests
const errorHandler = (error, request, response, next) => {
    console.log(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformated id'})
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }

    next(error)
}

app.use(errorHandler)



const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})