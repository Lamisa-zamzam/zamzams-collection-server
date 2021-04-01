const express = require("express");
const app = express();
const port = 5000;

const cors = require("cors");
app.use(cors());
app.use(express.json());

const ObjectID = require("mongodb").ObjectID;

require("dotenv").config();

const MongoClient = require("mongodb").MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hwuiv.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(
    uri,
    { useUnifiedTopology: true },
    { useNewUrlParser: true }
);

client.connect((err) => {
    const productCollection = client
        .db(process.env.DB_NAME)
        .collection("products");
    console.log("db connected");

    app.post("/addProduct", (req, res) => {
        const product = req.body;

        productCollection
            .insertMany(product)
            .then((result) => res.send(result.insertedCount > 0));
    });

    app.get("/products", (req, res) => {
        productCollection.find({})
        .toArray((err, documents) => {
            res.send(documents);
        })
    })

    app.get("/product/:_id", (req, res) => {
        const _id = ObjectID(req.params._id);
        productCollection.find({_id: _id})
        .toArray((err, documents) => {
            res.send(documents[0]);
        })
    })
});

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.listen(process.env.PORT || port, () => {
    console.log(`Listening to you, PORT ${port}`);
});
