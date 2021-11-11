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

        // get all order
        app.get('/orders', async (req, res) => {
            const cursor = ordersCollection.find({});
            const result = await cursor.toArray();
            console.log(result);
            res.send(result);
        });

        // password user update
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        });

        // email user update to database
        app.put('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user }
            const result = await usersCollection.updateOne(query, updateDoc, options);
            res.send(result);
        });

        // check admin status
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.send({ admin: isAdmin });
        });

        // update order status
        app.put('/update_status/:id', async (req, res) => {
            const filter = { _id: ObjectId(req.params.id) };
            const updateDoc = { $set: { status: req.body.status } };
            const result = await ordersCollection.updateOne(filter, updateDoc);
            res.send(result);
        });

        // delete a order
        app.delete('/delete_order/:id', async (req, res) => {
            const filter = { _id: ObjectId(req.params.id) };
            const result = await ordersCollection.deleteOne(filter);
            res.send(result);
        });

        // delete a service
        app.delete('/delete_service/:id', async (req, res) => {
            const filter = { _id: ObjectId(req.params.id) };
            const result = await ordersCollection.deleteOne(filter);
            res.send(result);
        });

        // make admin
         app.put('/users/admin', async (req, res) => {
             const user = req.body;
             const filter = { email: user.email }
             const updateDoc = { $set: { role: 'admin' } };
             const result = await usersCollection.updateOne(filter, updateDoc);
             res.send(result);
         });
         
        // make admin
       /*  app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email }

            const find = await usersCollection.find(filter).toArray();
            if (find) {
                const updateDoc = { $set: { role: 'admin' } };
                const result = await usersCollection.updateOne(filter, updateDoc)
                console.log(result);
                res.send(result);
            }
            else {
                res.send(401)
            }
            console.log(find);
        }); */

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