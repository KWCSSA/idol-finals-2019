const dotenv = require("dotenv");
dotenv.config();
const auth = require("./auth/auth");
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
var app = express();

// app.use('/admin', (req, res, next) => {
//   req.auth?
//   next()
//   !req.auth
//   res.status(401).end()
// })

// app.use(auth);
app.use(bodyParser.json());
const { sysLogger } = require("./utils/Logger");

if (process.env.NODE_ENV === "production") {
  mongoose.connect(
    `mongodb://${process.env.ADMIN_USERNAME}:${process.env.ADMIN_DBPASS}@172.105.28.135:27017/idol-finals-2019?authSource=admin`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  );
} else {
  app.use(cors());
  mongoose.connect("mongodb://localhost/idol-finals-2019", {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
}
var db = mongoose.connection;
db.on("error", error => {
  sysLogger.log("error", "Database connection error");
});
db.once("open", () => {
  runApp();
});

mongoose.set("useFindAndModify", false);
//Schema & Model
const Schema = mongoose.Schema;

const voteSchema = new Schema({
  id: String,
  A_vote: Number,
  B_vote: Number,
  C_vote: Number,
  D_vote: Number
});
const modeSchema = new Schema({
  id: String,
  value: String
});

const voteModel = mongoose.model("voteModel", voteSchema);
const modeModel = mongoose.model("modeModel", modeSchema);

var data = {
  mode: {
    id: "current-mode",
    value: "1/4"
  },
  state: false,
  currentMatch: ""
};

app.get("/", (req, res) => {
  res.send("Hello World!");
});
//----------------mode--------------------------

//init mode
app.post("/initMode", (req, res) => {
  sysLogger.log("info", "/initMode called");
  var newMode = new modeModel({
    id: "current-mode",
    value: "1/4"
  });
  newMode.save(function(err, back) {
    if (err) return handleError(err);
    else {
      res.send({ status: "success" });
    }
  });
});

//get current mode
app.get("/currentMode", (req, res) => {
  sysLogger.log("info", "/currentMode called");
  modeModel.find({ id: "current-mode" }, function(err, docs) {
    if (err) return handleError(err);
    else {
      res.send(docs);
    }
  });
});

//update voting mode
app.put("/changeMode", (req, res) => {
  sysLogger.log("info", "/changeMode called");
  modeModel.findOneAndUpdate(
    { id: "current-mode" },
    { value: req.body.value },
    {
      new: true
    },
    function(err, docs) {
      if (err) return handleError(err);
      else {
        res.send({ status: "success" });
      }
    }
  );
});

//----------------vote--------------------------

//init votes
app.get("/currentStatus", (req, res) => {
  sysLogger.log("info", "/currentStatus called");
  res.send(data);
});

app.post("/initVotes", (req, res) => {
  sysLogger.log(
    "info",
    "================================================================================"
  );
  sysLogger.log("info", "/initVotes called");
  data.currentMatch = Date.now().toString();
  var newVote = new voteModel({
    id: data.currentMatch,
    A_vote: 0,
    B_vote: 0,
    C_vote: 0,
    D_vote: 0
  });
  newVote.save(function(err, back) {
    if (err) return handleError(err);
    else {
      res.send({ status: "success", currentMatch: data.currentMatch });
      sysLogger.log("info", "--curretMatch: " + data.currentMatch);
    }
  });
});

//get current votes
app.get("/currentVotes", (req, res) => {
  sysLogger.log("info", "/currentVotes called");
  voteModel.find({ id: data.currentMatch }, function(err, voteModels) {
    if (err) return handleError(err);
    else {
      res.send({ status: "success", current_vote: voteModels });
    }
  });
});

//update votes
app.put("/modifyVotes", (req, res) => {
  sysLogger.log("info", "/modifyVotes called");
  voteModel.findOneAndUpdate(
    { id: data.currentMatch },
    {
      A_vote: req.body.votes_A,
      B_vote: req.body.votes_B,
      C_vote: req.body.votes_C,
      D_vote: req.body.votes_D
    },
    {
      new: true
    },
    function(err) {
      if (err) return handleError(err);
      else {
        res.send({ status: "success" });
      }
    }
  );
});

//----------------state--------------------------

//change voting state
app.put("/changeState", (req, res) => {
  sysLogger.log("info", "/changeState called");
  data.state = req.body.state;
  if (req.body.state) {
    sysLogger.log("info", "--vote for " + data.currentMatch + " started");
  } else {
    sysLogger.log("info", "--vote for " + data.currentMatch + " ended");
  }
  res.send({ status: "success" });
});

app.get("/currentState", (req, res) => {
  sysLogger.log("info", "/changeState called");
  res.send({ state: data.state });
});

function runApp() {
  const PORT = process.env.PORT || 9898;
  app.listen(PORT, () => {
    sysLogger.log(
      "info",
      "================================================================================"
    );
    sysLogger.log("info", `DB Connected, listening on PORT ${PORT}`);
  });
}
