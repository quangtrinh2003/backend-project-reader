const express = require("express");
const morgan = require("morgan");
const userRoutes = require("./routes/userRoutes");
const novelRoutes = require("./routes/novelRoutes");
const errorHandler = require("./controllers/errorHandlerController");
const cors = require("cors");
const app = express();

app.use(cors({credentials: true}));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.text({ limit: "500kb" }));

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/novels", novelRoutes);
app.use(errorHandler);

module.exports = app;
