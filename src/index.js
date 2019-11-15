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

const voteModel = mongoose.model("voteModel", voteSchema);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

//get current votes
app.get("/currentVotes", (req, res) => {
  res.send("get current Votes ");
});

//modify votes
app.put("/modifyVotes", (req, res) => {
  res.send("votes modified");
});

//change voting mode
app.put("/changeMode", (req, res) => {
  res.send("voting mode updated");
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
