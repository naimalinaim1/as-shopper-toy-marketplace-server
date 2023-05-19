var express = require("express");
var cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
var app = express();
const port = 3000;

// middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Toy Car sport server is running!");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ybzmsy1.mongodb.net/?retryWrites=true&w=majority`;

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
    client.connect();
    const toyCollection = client.db("toyDB").collection("toys");

    // get all toys
    app.get("/toys", async (req, res) => {
      const sellerEmail = req.query?.email;
      const id = req.query?.id;
      const subCategory = req.query?.subCategory;
      let query = {};
      if (sellerEmail) {
        query = { sellerEmail };
      }
      if (!sellerEmail && id) {
        query = { _id: new ObjectId(id) };
      }

      if (!sellerEmail && !id && subCategory) {
        query = { subCategory };
      }

      if (!sellerEmail && !id && subCategory) {
        query = { subCategory };
      }

      const result = await toyCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/searchToy", async (req, res) => {
      const toyName = req.query?.searchToy;
      const query = {
        name: {
          $regex: toyName,
          $options: "i", // "i" for case-insensitive search
        },
      };
      const result = await toyCollection.find(query).toArray();
      res.send(result);
    });

    // create a toys
    app.post("/toys", async (req, res) => {
      const toy = req.body;
      const result = await toyCollection.insertOne(toy);
      res.send(result);
    });

    // update toy
    app.patch("/toys", async (req, res) => {
      const id = req.body._id;
      const update = req.body;
      delete update._id;

      const filter = { _id: new ObjectId(id) };
      const doc = {
        $set: {
          ...update,
        },
      };
      const result = await toyCollection.updateOne(filter, doc);
      res.send(result);
    });

    // delete toy
    app.delete("/toys", async (req, res) => {
      const id = req.query?.id;
      const filter = { _id: new ObjectId(id) };
      const result = await toyCollection.deleteOne(filter);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
