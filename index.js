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

    const ordersCollection = client
        .db(process.env.DB_NAME)
        .collection("orders");
    console.log("db connected");

    app.post("/addProduct", (req, res) => {
        const product = req.body;
        console.log(product);
        productCollection
            .insertOne(product)
            .then((result) => res.send(result.insertedCount > 0));
    });

    app.get("/products", (req, res) => {
        productCollection.find({}).toArray((err, documents) => {
            res.send(documents);
        });
    });

    app.get("/product/:_id", (req, res) => {
        const _id = ObjectID(req.params._id);
        productCollection.find({ _id: _id }).toArray((err, documents) => {
            res.send(documents[0]);
        });
    });

    app.post("/addOrder", (req, res) => {
        const order = req.body;
        console.log(order);
        ordersCollection
            .insertOne(order)
            .then((result) => res.send(result.insertedCount > 0));
    });

    app.delete("/deleteProduct/:_id", (req, res) => {
        const _id = ObjectID(req.params._id);
        productCollection
            .deleteOne({
                _id: _id,
            })
            .then((result) => res.send(result.deletedCount > 0));
    });

    app.get("/orders", (req, res) => {
        const queryEmail = req.query.email;
        ordersCollection
            .find({ email: queryEmail })
            .toArray((err, documents) => {
                res.send(documents);
            });
    });

    app.get("/search/:searchStr", (req, res) => {
        const searchStr = req.params.searchStr;
        productCollection
            .find({ product: new RegExp(searchStr, "i") })
            .toArray((err, documents) => {
                res.send(documents);
                console.log(documents);
            });
    });

    app.patch("/editProduct/:_id", (req, res) => {
        productCollection
            .updateOne(
                { _id: ObjectID(req.params.id) },
                {
                    $set: {
                        product: req.body.product,
                        size: req.body.size,
                        price: req.body.price,
                        owner: req.body.owner,
                        detail: req.body.owner,
                    },
                }
            )
            .then((result) => {
                res.send(result.modifiedCount > 0);
                console.log(result);
            });
    });
});

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.listen(process.env.PORT || port, () => {
    console.log(`Listening to you, PORT ${port}`);
});
