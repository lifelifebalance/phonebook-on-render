const mongoose = require('mongoose')

if ((process.argv.length !== 3) && (process.argv.length !== 5)) {
    console.log('Add a contact with: node mongo.js <password> <name> <number>')
    console.log('List all contacts with: node mongo.js <password>')
    process.exit(1)
}


const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

const url = `mongodb+srv://zlurm:${password}@cluster0.beaquir.mongodb.net/phonebookApp?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: String,
    number: String
})

const Person = mongoose.model('Person', personSchema)



// Save Contacts to db
if (process.argv.length === 5) {

    const person = new Person({
        name: name,
        number: number
    })

    person.save().then(result => {
        console.log(`added ${name} number ${number} to phonebook`)
        mongoose.connection.close()
    })
}

// List all contacts
if (process.argv.length === 3) {
    Person.find({}).then(result => {
        console.log('phonebook:')
        result.forEach(person => {
            console.log(`${person.name} ${person.number}`)
        })
        mongoose.connection.close()
    })
}