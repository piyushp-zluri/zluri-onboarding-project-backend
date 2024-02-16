const express = require("express");
const { mongoConnect } = require("./mongoConnect");
const routes = require("./router/routes");

const app = express();
const port = 3000;

app.use(express.json());

mongoConnect()
  .then(() => {
    app.use("/api", routes);

    app.listen(port, () => {
      console.log(`Service is hosted at http://127.0.0.1:${port}`);
    });
  })
  .catch((err) => console.error("Error connecting to MongoDB:", err));
