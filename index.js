const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.POST || 2737;
const userdb = process.env.USER_DB;
const passdb = process.env.PASS_DB;
const secretToken = process.env.SECRET_TOKE;

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);

const uri = `mongodb+srv://${userdb}:${passdb}@cluster0.yhpfxjc.mongodb.net/?retryWrites=true&w=majority`;

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
    await client.connect();
    const usersCollection = client.db("tourisguide").collection("users");
    const storisCollection = client.db("tourisguide").collection("storis");
    const packagesCollection = client.db("tourisguide").collection("packages");
    const wishlistCollection = client.db("tourisguide").collection("wishlist");
    const bookingsCollection = client.db("tourisguide").collection("bookings");
    const guidesCollection = client.db("tourisguide").collection("guides");

    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, secretToken, {
        expiresIn: "365d",
      });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: true });
    });

    // Logout
    app.get("/logout", async (req, res) => {
      try {
        res
          .clearCookie("token", {
            maxAge: 0,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
          })
          .send({ success: true });
      } catch (err) {
        res.status(500).send(err);
      }
    });
    app.post("/guides", async (req, res) => {
      const guideData = req.body;
      const result = await guidesCollection.insertOne(guideData);
      res.send(result);
    });
    app.get("/tourguides", async (req, res) => {
      const result = await guidesCollection.find().toArray();
      res.send(result);
    });
    app.get("/guides/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await guidesCollection.findOne(query);
      res.send(result);
    });
    app.post("/bookings", async (req, res) => {
      const addData = req.body;
      const result = await bookingsCollection.insertOne(addData);
      res.send(result);
    });
    app.get("/bookings/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await bookingsCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/mybookings/:email", async (req, res) => {
      const email = req.params.email;
      const query = { gemail: email };
      const result = await bookingsCollection.find(query).toArray();
      res.send(result);
    });
    app.delete("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookingsCollection.deleteOne(query);
      res.send(result);
    });

    app.patch("/update-status-reject/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      console.log(id, data);
      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          status: data.status,
        },
      };
      const result = await bookingsCollection.updateOne(query, updateDoc);
      res.send(result);
    });
    app.patch("/update-status-accept/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      console.log(id, data);
      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          status: data.status,
        },
      };
      const result = await bookingsCollection.updateOne(query, updateDoc);
      res.send(result);
    });
    app.post("/wishlist", async (req, res) => {
      const addwishlist = req.body;
      const result = await wishlistCollection.insertOne(addwishlist);
      res.send(result);
    });
    app.get("/wishlist/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await wishlistCollection.find(query).toArray();
      res.send(result);
    });
    app.delete("/wishlist/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await wishlistCollection.deleteOne(query);
      res.send(result);
    });
    app.post("/packages", async (req, res) => {
      const addPackages = req.body;
      const result = await packagesCollection.insertOne(addPackages);
      res.send(result);
    });
    app.get("/packages/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await packagesCollection.findOne(query);
      res.send(result);
    });
    app.get("/packages", async (req, res) => {
      const result = await packagesCollection.find().toArray();
      res.send(result);
    });
    app.post("/storis", async (req, res) => {
      const addData = req.body;
      const result = await storisCollection.insertOne(addData);
      res.send(result);
    });
    app.get("/storis", async (req, res) => {
      const result = await storisCollection.find().toArray();
      res.send(result);
    });
    app.get("/storis/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await storisCollection.findOne(query);
      res.send(result);
    });
    app.put("/users/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const query = { email: email };
      const options = { upsert: true };
      const isExist = await usersCollection.findOne(query);
      // console.log('User found?----->', isExist)
      if (isExist) return res.send(isExist);
      const result = await usersCollection.updateOne(
        query,
        {
          $set: { ...user, timestamp: Date.now() },
        },
        options
      );
      res.send(result);
    });
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await usersCollection.findOne(query);
      res.send(result);
    });
    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    app.patch("/user/:id", async (req, res) => {
      const id = req.params.id;
      const addData = req.body.role;
      const query = { _id: new ObjectId(id) };
      const updateData = {
        $set: {
          role: addData,
        },
      };
      const result = await usersCollection.updateOne(query, updateData);
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

app.get("/", (req, res) => {
  res.send("Tour Guide Server is Running...");
});

app.listen(port, () => {
  console.log(`Server Is Running On http://${port}`);
});
