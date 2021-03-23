const express = require("express");
// require("./db/mongoose");

const adminRouter = require("./routers/admin");
const productRouter = require("./routers/product");

const app = express();

app.use(express.json());
app.use(adminRouter);
app.use(productRouter);

module.exports = app;
