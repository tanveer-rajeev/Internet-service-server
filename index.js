const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
require('dotenv').config()

const uri = "mongodb+srv://tanveer:tanveer123@cluster0.qsr7x.mongodb.net/doctors-portal?retryWrites=true&w=majority";

const app = express()

app.use(express.json());
app.use(cors());
app.use(express.static('doctors'));
app.use(fileUpload());

const port = 5000;

app.get('/', (req, res) => {
    console.log('database is working');
})

const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
client.connect(err => {
    const appointmentCollection = client.db("doctors-portal").collection("appointments");
    const doctorCollection = client.db("doctors-portal").collection("doctors");
    const reviewCollection = client.db("doctors-portal").collection("reviews");
    const serviceCollection = client.db("doctors-portal").collection("service");

    console.log('database connected')

    app.post('/addAppointment', (req, res) => {
        const appointment = req.body;
        appointmentCollection.insertOne(appointment)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    });

    app.get('/appointments', (req, res) => {
        appointmentCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.post('/appointmentsByDate', (req, res) => {
        const date = req.body;
        const email = req.body.email;
        doctorCollection.find({email: email})
            .toArray((err, doctors) => {
                const filter = {date: date.date}
                if (doctors.length === 0) {
                    filter.email = email;
                }
                appointmentCollection.find(filter)
                    .toArray((err, documents) => {
                        console.log(email, date.date, doctors, documents)
                        res.send(documents);
                    })
            })
    })

    app.post('/addAdmin', (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const email = req.body.email;
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        let image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        doctorCollection.insertOne({name, email, image})
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })
    app.post('/addService', (req, res) => {

        const bandwidth = req.body.bandwidth;
        const service_hour = req.body.service_hour;
        const ip_service = req.body.ip_service;
        const monthly_charge = req.body.monthly_charge;

        serviceCollection.insertOne({bandwidth, service_hour, ip_service, monthly_charge})
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })
    app.get('/getServices', (req, res) => {

        serviceCollection.find({})
            .toArray((err, document) => {
                res.send(document);
            })
    })

    app.delete('/deleteService/:id', (req, res) => {
        serviceCollection.deleteOne({_id: ObjectID(req.params.id)})
            .then(result => {
                res.send(result.deletedCount > 0);
            })
    })

    app.post('/addReview', (req, res) => {

        const name = req.body.name;
        const email = req.body.email;
        const review = req.body.review;

        reviewCollection.insertOne({name, email, review})
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })
    app.get('/admins', (req, res) => {
        doctorCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });
    app.get('/reviews', (req, res) => {
        reviewCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });
    app.post('/isAdmin', (req, res) => {
        const email = req.body.email;
        doctorCollection.find({email: email})
            .toArray((err, doctors) => {
                res.send(doctors.length > 0);
            })
    })

});

app.listen(process.env.PORT || port)