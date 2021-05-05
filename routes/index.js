var express = require("express");
var moment = require("moment");
var router = express.Router();
const ObjectID = require("mongodb").ObjectID;

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("home", { title: "Home" });
});

/* GET Hello World page. */
router.get("/healthcheck", function (req, res) {
  res.render("blank", { title: "Healthy!" });
});

router.get("/success", function (req, res) {
  res.render("blank", { title: "Success" });
});

/* GET Hello World page. */
router.get("/insomnia", function (req, res) {
  res.render("insomnia", { title: "Insomnia Severity Index" });
});

router.put("/survey/:userId", function (req, res) {
  var answers = [
    parseInt(req.body.Q1),
    parseInt(req.body.Q2),
    parseInt(req.body.Q3),
    parseInt(req.body.Q4),
    parseInt(req.body.Q5),
    parseInt(req.body.Q6),
    parseInt(req.body.Q7),
  ];

  var db = req.db;
  var collection = db.get("usercollection");

  collection.findOneAndUpdate(
    { _id: new ObjectID(req.params.userId) },
    { $set: { answers: answers } },
    function (err, doc) {
      if (err) {
        res.send("There was a problem adding the information to the database.");
      } else {
        res.redirect(`/results/${doc._id}`);
      }
    },
    { upsert: true }
  );
});

/* POST to Add User Service */
router.post("/newsurvey", function (req, res) {
  var db = req.db;
  var name = req.body.name;
  var collection = db.get("usercollection");

  collection.insert(
    { name: name, answers: null, created_at: moment()._d },
    function (err, doc) {
      if (err) {
        res.send("There was a problem adding the information to the database.");
      } else {
        res.redirect(`/survey/${doc._id}`);
      }
    }
  );
});

router.get("/survey", function (req, res) {
  let params = new URLSearchParams(req.url);
  res.redirect(`/survey/${params.get("/survey?userId")}`);
});

router.get("/survey/:userId", function (req, res) {
  res.render("insomnia", {
    title: "Insomnia Severity Index",
    userId: req.params.userId,
  });
});

router.get("/results", function (req, res) {
  let params = new URLSearchParams(req.url);
  res.redirect(`/results/${params.get("/results?userId")}`);
});

router.get("/results/:userId", function (req, res) {
  var db = req.db;
  var collection = db.get("usercollection");
  collection.find(
    { _id: new ObjectID(req.params.userId) },
    {},
    function (e, docs) {
      let response = docs[0];
      let score = response.answers.reduce((a, b) => {
        return a + b;
      }, 0);
      res.render("results", {
        title: "Results",
        name: response.name,
        score: score,
        id: response._id,
      });
    }
  );
});

router.delete("/deletesurvey", function (req, res) {
  let params = new URLSearchParams(req.url);
  var db = req.db;
  var collection = db.get("usercollection");
  collection.remove(
    { _id: req.body.userId },
    function (e, docs) {
      if (e) {
      } else {
        res.redirect("helloworld");
      }
    },
    { justOne: true }
  );
});

module.exports = router;
