const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const MongoClient = require("mongodb").MongoClient;
// const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();

const app = express();


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zjved.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const admin = require("firebase-admin");

var serviceAccount = require("./configs/burj-al-arab-c8679-firebase-adminsdk-lrbuf-32893bffb1.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_URL
});


const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect((err) => {
  const bookings = client.db("khela").collection("hobe");
  console.log("Connected");

  // const product = {name : "Noor", price : 34}
  // bookings.insertOne(product)
  //   .then(result => {
  //     console.log(3233)
  //   })

  app.post("/addbooking", (req, res) => {
    const newbooking = req.body;
    console.log(newbooking);
    bookings.insertOne(newbooking).then((result) => {
      console.log(result);
      res.send(result.insertedCount > 0);
    });
  });

  // app.get('/bookings', (req, res) => {
  //   console.log(req.query.email);
  //   console.log(req.headers.authorization);
  //   if(req.headers.authorization && ){

  //   }

  //   // idToken comes from the client app
  //     admin.auth().verifyIdToken(idToken)
  //     .then(function(decodedToken) {
  //       let uid = decodedToken.uid;
  //       // ...
  //     }).catch(function(error) {
  //       // Handle error
  //     });
  //   bookings.find({email : req.query.email})
  //   .toArray((err, docs) => {
  //     res.send(docs)
  //   })
  // })
  // })

  app.get("/bookings", (req, res) => {
    console.log(req.headers.authorization);
    const bearer = req.headers.authorization;
    if (bearer && bearer.startsWith("Bearer ")) {
      const idToken = bearer.split(" ")[1];
      console.log({idToken});
      admin
        .auth()
        .verifyIdToken(idToken)
        .then(function (decodedToken) {
          const tokenEmail = decodedToken.email;
          const queryEmail = req.query.email;
          console.log(tokenEmail, queryEmail);
          if (tokenEmail == queryEmail) {
            bookings.find({ email: queryEmail }).toArray((err, documents) => {
              res.status(200).send(documents);
            });
          } else {
            res.status(401).send("un-authorized access");
          }
        })
        .catch(function (error) {
          res.status(401).send("un-authorized access");
        });
    } else {
      res.status(401).send("un-authorized access");
    }
  });
});
app.get("/", (req, res) => {
  res.send("Hello World!");
});

const port = 5000;

// app.listen(port, () => {
//   console.log(`Example app listening at http://localhost:${port}`);
// });


app.listen(process.env.PORT || port)