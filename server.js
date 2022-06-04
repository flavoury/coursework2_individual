const express = require('express')
const app = express()
const cors = require('cors')

//modules for static file
var path = require("path")
var fs = require("fs")
app.use(express.json())
app.use(cors())

//logger middleware
app.use(function (req, res, next) {
    console.log("Request URL: " + req.url);
    console.log("Request Date: " + new Date());
    next();
});
// STATIC FILE MIDDLEWARE
app.use(function(req, res, next){
    var filePath = path.join(__dirname, "static", req.url)
    fs.stat(filePath, function(err, fileInfo){
        if (err) {
            next()
            return
        }
        if (fileInfo.isFile()) {
            res.sendFile(filePath)
        }
        else{
            next()
        }
    })
})

// connect to MongoDB
const ObjectId = require('mongodb').ObjectId;
const MongoClient = require('mongodb').MongoClient;
let db;
MongoClient.connect('mongodb+srv://pelumiola1:olaayanfe123@cluster0.j0gma.mongodb.net/?retryWrites=true&w=majority', (err, client) => {
    db = client.db('lessons')
})
// Parameters middleware
app.param('collectionName', (req, res, next, collectionName) => {
    req.collection = db.collection(collectionName);
    return next()
});
// dispaly a message for root path to show that API is working
app.get('/', (req, res, next) => {
    res.send('Select a collection, e.g., /collection/messages')
})
// GET ALL LESSONS FROM DB
// retrieve all the objects from an collection
app.get('/collection/:collectionName', (req, res, next) => {
    req.collection.find({}).toArray((e, results) => {
        if (e) return next(e)
        res.send(results)
    })
})

// retrieve an object by mongodb ID
app.get('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.findOne(
        { _id: new ObjectId(req.params.id) },
        (e, result) => {
            if (e) return next(e)
            res.send(result)
        }) 
})

// Insert JSON Object to MongoDB - Add an Order
app.post('/collection/:collectionName', (req, res, next) => {
    req.collection.insertOne(req.body, (e, results) => {
        if (e) return next(e);
        console.log(results);
        res.json(results)
    })
})

// Update lesson by ID
app.put('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: req.body },
        { safe: true, multi: false },
        (e, result) => {
            console.log(result)
            if (e) return next(e)
            res.send((result.modifiedCount === 1) ? 
                { msg: 'success' } : { msg: 'error' })
        })
})


const port = process.env.PORT || 3000
app.listen(port)