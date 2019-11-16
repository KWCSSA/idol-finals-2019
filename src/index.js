const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const { sysLogger } = require("./utils/Logger");

var app = express();

if (process.env.NODE_ENV === "production") {
  mongoose.connect(
    `mongodb://${process.env.ADMIN_USERNAME}:${process.env.ADMIN_DBPASS}@172.105.28.135:27017/idol-finals-2019?authSource=admin`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  );
} else {
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

//Schema & Model
const Schema = mongoose.Schema;

const voteSchema = new Schema({
  A_vote: Number,
  B_vote: Number,
  C_vote: Number,
  D_vote: Number
});
const modeSchema = new Schema({
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

//init votes
app.post("/initVotes", (req, res) => {
  var newVote = new voteModel({
    A_vote: 0,
    B_vote: 0,
    C_vote: 0,
    D_vote: 0
  });
  newVote.save(function(err, back) {
    if (err) return handleError(err);
    else {
      data.currentMatch = back.id;
      res.send({ status: "success", id: back.id });
    }
  });
});

//init mode
app.post("/initMode", (req, res) => {
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

//get current votes
app.get("/currentVotes", (req, res) => {
  voteModel.findById(req.params.id, function(err, voteModels) {
    if (err) return handleError(err);
    else {
      console.log(voteModels);
      res.send({ status: "success", current_vote: voteModels });
    }
  });
});

//modify votes
app.put("/modifyVotes", (req, res) => {
  voteModel.findByIdAndUpdate(data.currentMatch, req.body.votes, function(err) {
    if (err) return handleError(err);
    else {
      res.send({ status: "success" });
    }
  });
});

//change voting mode
app.put("/changeMode", (req, res) => {
  modeModel.findOneAndUpdate({ id: "current-mode" }, req.body.mode, function(
    err,
    docs
  ) {
    if (err) return handleError(err);
    else {
      res.send({ status: "success" });
    }
  });
});

//change voting state
app.put("/changeState", (req, res) => {
  data.state = req.body.state;
  res.send({ status: "success" });
});

app.get("/currentMode", (req, res) => {
  modeModel.find({ id: "current-mode" }, function(err, docs) {
    if (err) return handleError(err);
    else {
      res.send({ value: docs.value });
    }
  });
});

app.get("/currentState", (req, res) => {
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
