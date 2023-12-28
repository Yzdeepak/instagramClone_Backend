const express = require("express")
const cors = require("cors")
const app = express()
const mongoose = require("mongoose")
const port = 5000
const dotenv = require("dotenv")
const user = require("./router/User")
const post = require("./router/Post")


dotenv.config()
mongoose.connect(process.env.MONGO_URL)
    .then((res) => {
        console.log("connected mongodb")
    })
    .catch((err) => {
        console.log("not connected")
    })

app.use(cors())
app.use(express.json())
app.use("/api/user", user)
app.use("/api/post", post)


app.listen(port, (req, res) => {
    console.log("server is start")
})