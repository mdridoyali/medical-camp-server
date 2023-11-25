const express = require("express");
const cors = require("cors");
require("dotenv").config();
const jwt = require('jsonwebtoken')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// middle were
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.w9fev91.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    const campCollection = client.db("mediCampDB").collection("camps");
    const usersCollection = client.db("mediCampDB").collection("users");


    // user related api
    app.post('/users', async (req, res) => {
      const user = req.body
      console.log(user)
      const query = { email: user?.email }
      const existingUser = await usersCollection.findOne(query)
      if (existingUser) {
        return res.send({ message: 'user already exists', insertedId: null })
      }
      const result = await usersCollection.insertOne(user)
      res.send(result)
    })

   

    // camp related api
    app.post('/add-a-camp', async (req, res) => {
      const camp = req.body
      const result = await campCollection.insertOne(camp);
      res.send(result)
    })

    app.get('/all-camps', async (req, res) => {
      const result = await campCollection.find().toArray();
      res.send(result)
    })

    app.get('/camp/:id',  async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await campCollection.findOne(query)
      res.send(result)
    })

    app.delete('/camp/:id',  async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await campCollection.deleteOne(query)
      res.send(result)
    })

    app.patch('/menu/:id', async (req, res) => {
      const id = req.params.id
      const item = req.body
      const query = { _id: new ObjectId(id) }
      const updatedDoc = {
        $set: {
          name: item.name,
          price: item.price,
          category: item.category,
          recipe: item.recipe,
          image: item.image
        }
      }
      const result = await campCollection.updateOne(query, updatedDoc)
      res.send(result)
    })



  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("medical camp is open");
});

app.listen(port, () => {
  console.log(`Medical camp is open on port ${port}`);
});







