var express = require("express");
var cors = require("cors");
var app = express();
const port = 3000;

// middleware
app.use(cors());

app.get("/", (req, res) => {
  res.send("Toy Car sport server is running!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
