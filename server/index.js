const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
require("dotenv").config();

const routes = require("./routes");

const PORT = process.env.PORT || 4000;

const app = express();

app.use(bodyParser.json());

routes(app);

app.use(express.static(path.resolve(__dirname, "../react-ui/build")));

app.get("/*", function(request, response) {
  response.sendFile(path.resolve(__dirname, "../react-ui/build", "index.html"));
});

app.listen(PORT, function() {
  console.error(`Server listening on port ${PORT}`);
});
