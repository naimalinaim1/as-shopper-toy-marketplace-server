const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const app = express();
const port = 3000;

// middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Toy Car sport server is running!");
});

// jwt
app.post("/jwt", (req, res) => {
  const email = req.body;
  const token = jwt.sign(email, process.env.Jwt_ACCESS_SECRET, {
    expiresIn: "1d",
  });
  res.send({ token });
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
      let sorting = {};
      if (sellerEmail) {
        query = { sellerEmail };
        sorting = { price: 1 };
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

      const result = await toyCollection.find(query).sort(sorting).toArray();
      res.send(result);
    });

    // sort by price
    app.get("/sortByPrice", async (req, res) => {
      const sellerEmail = req.query?.email;
      const sort = parseInt(req.query?.sort);

      const result = await toyCollection.find({ sellerEmail }).toArray();
      let sortby;
      if (sort == 1) {
        sortby = result.sort((a, b) => a.price - b.price);
      } else {
        sortby = result.sort((a, b) => b.price - a.price);
      }
      res.send(sortby);
    });

    app.get("/searchToy", async (req, res) => {
      const toyName = req.query?.searchToy;
      const page = parseInt(req.query?.page);
      const size = parseInt(req.query?.size);
      const skip = page * size;

      let query = {};
      if (toyName) {
        query = {
          name: {
            $regex: toyName,
            $options: "i", // "i" for case-insensitive search
          },
        };
      }

      const result = await toyCollection
        .find(query)
        .skip(skip)
        .limit(size)
        .toArray();
      res.send(result);
    });

    // get total toys length
    app.get("/totalToys", async (req, res) => {
      const toyName = req.query?.searchToy;
      let query = {};
      if (toyName) {
        query = {
          name: {
            $regex: toyName,
            $options: "i", // "i" for case-insensitive search
          },
        };
      }
      const totalToy = await toyCollection.countDocuments(query);
      res.send({ totalToy });
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
