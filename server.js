const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const app = require("./app");

dotenv.config({ path: "./config.env" });
const DB_URL = process.env.DB.replace("<password>", process.env.DB_PASSWORD);

(async () => {
  await mongoose.connect(DB_URL);
})();

app.listen(Number(process.env.PROCESS_PORT), "localhost", () => {
  console.log("App running");
});
