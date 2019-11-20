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

const singleVoteSchema = new Schema({
  id: String,
  matchID: String,
  candidate: Number,
  time: Date
});

const idSchema = new Schema({
  id: String,
  loginStatus: Boolean
})

const voteModel = mongoose.model("voteModel", voteSchema);
const modeModel = mongoose.model("modeModel", modeSchema);
const singleVoteModel = mongoose.model("singleVoteModel", singleVoteSchema);
const idModel = mongoose.model("idModel", idSchema);

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

const makeid = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

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

// user voting using ID
app.post("/voteCandidate", (req, res) => {
  sysLogger.log("info", "/voteCandidate called");

  // if the mode value is "1/2", reject vote=3 and vote=4
  // and if the mode value is "1/3", reject vote=4
  
  if (data.mode.value === "1/2" && (req.body.candidate == 3 || req.body.candidate == 4)){
    res.send({status: "failure: 1/2"});
  } else if (data.mode.value === "1/3" && req.body.candidate == 4){
    res.send({status: "failure: 1/3"});
  }

  var newSingleVote = new singleVoteModel({
    id: req.body.id,
    matchID: req.body.matchID,
    candidate: req.body.candidate,
    time: req.body.time
  });
  newSingleVote.save(function(err, back) {
    if (err) return handleError(err);
  });

  // find the voteModel with the corresponding MatchID and modify it based on req.data.candidate

  voteModel.find(
    { id: data.currentMatch},
    function(err, voteModels){
      if (err) return handleError(err);
      else {
        if (voteModels[0] == null) res.send({status: "failure: no vote models"});
        voteModel.findOneAndUpdate(
          { id: data.currentMatch },
          {
            A_vote: (req.body.candidate === 1) ? voteModels[0].A_vote + 1: voteModels[0].A_vote,
            B_vote: (req.body.candidate === 2) ? voteModels[0].B_vote + 1: voteModels[0].B_vote,
            C_vote: (req.body.candidate === 3) ? voteModels[0].C_vote + 1: voteModels[0].C_vote,
            D_vote: (req.body.candidate === 4) ? voteModels[0].D_vote + 1: voteModels[0].D_vote,
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

// ----------------login --------------------

// user login using ID
app.post("/login", (req, res) => {
  sysLogger.log("info", "/login called");
  var id = req.body.id;
  sysLogger.log("info", "new login attempt: id = " + id);
  idModel.find({ id: id }, function(err, idModels) {
    if (err) return handleError(err);
    else {
      var idstatus = idModels[0].loginStatus;
      sysLogger.log("info", "id: " + id + ", status: " + idstatus);
      if (idstatus === false){
        idModel.findOneAndUpdate(
          {id: id}, 
          {loginStatus: true},
          {new: true},
          function(err, docs) {
            if (err) return handleError(err);
            else {
              res.send({ status: "success"});
            }
          }
        );
      } else if (idstatus === true){
        res.send({status: "already logged in"});
      } else if (idstatus === undefined){
        res.send({status: "id not found"});
      }
    }
  });
});

app.get("/initID", (req, res) => {
  const IDamount = 5;
  for (var i = 0; i < IDamount; i++){
    var randomID = makeid();
    var newID = new idModel({
      id: randomID,
      loginStatus: false
    });
    newID.save(function(err, back) {
      if (err) return handleError(err);
      else {
        sysLogger.log("info", "new ID: " + randomID + " created");
      }
    });
  }
  res.send({status: "success"});
});

app.get("/allID", (req, res) => {
  idModel.find({}, function(err, idModels) {
    if (err) return handleError(err);
    else {
      var allIDs = {};
      idModels.forEach((id) => {
        allIDs[id] = true;
      });
      res.send(allIDs);
    }
  })
});

app.get("/deleteAllID", (req, res) => {
  idModel.deleteMany({loginStatus: false}, function(err, back) {
    if (err) return handleError(err);
    else {
      res.send({status:"success"});
    }
  });
})
// ----------------------------------------------
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
