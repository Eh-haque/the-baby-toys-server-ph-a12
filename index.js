const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const app = express()
const cors = require('cors');
require('dotenv').config();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.ryljg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
console.log(uri);

async function run() {
    try {
        await client.connect();
        const database = client.db('assignment_12');
        const servicesCollection = database.collection('services');
        const ordersCollection = database.collection('orders');
        const usersCollection = database.collection('users');
        console.log('database connected');

        // add a service
        app.post('/services', async (req, res) => {
            const service = req.body;
            const result = await servicesCollection.insertOne(service);
            console.log(result);
            res.send(result);
        })

        // get services
        app.get('/services', async (req, res) => {
            const cursor = servicesCollection.find({});
            const result = await cursor.toArray();
            console.log(result);
            res.send(result);
        })

        // get a services
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await servicesCollection.findOne(query);
            res.send(result);
        })

        // add a order
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            console.log(result);
            res.send(result);
        })

        // password user update
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        });

        // email user update
        app.put('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user }
            const result = await usersCollection.updateOne(query, updateDoc, options);
            res.send(result);
        });

        // make admin
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            console.log(user);
            const filter = { email: user.email }
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.send(result);
        })

    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('running server...');
});

app.listen(port, () => {
    console.log('running server', port);
});