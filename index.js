const express = require("express");
const urlRoute = require("./routes/url");
const { connectMongoDB } = require("./connection");
const URL = require("./models/url");
const cookieParser=require("cookie-parser");

const staticRoute = require("./routes/staticRouter");
const path = require("path");

const userRoute=require("./routes/user");
const { restrictToLoggedinUserOnly,checkAuth } = require("./middleware/auth");

const app = express();
const PORT = 8001;

connectMongoDB("mongodb://localhost:27017/short-url")
    .then(() => console.log("MongoDB Connected"))

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());



app.use("/url",restrictToLoggedinUserOnly, urlRoute);
app.use("/user",userRoute);
app.use("/", checkAuth, staticRoute);


app.get("/url/:shortId", async (req, res) => {
    const shortId = req.params.shortId;
    const entery = await URL.findOneAndUpdate({
        shortId
    },
        {
            $push: {
                visitedHistory: {
                    timestamp: Date.now(),
                },
            }
        }
    )
  
    return res.redirect(entery.redirectURL);
})

app.listen(PORT, () => console.log(`server started at PORT ${PORT}`))