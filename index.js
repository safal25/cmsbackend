const express=require('express');
const mongoose=require('mongoose');
const dotenv=require('dotenv');
const cors=require('cors');

dotenv.config();

const Mongo_URI=process.env.Mongo_URI;
const port=process.env.port || 5000;

//Connecting with database
mongoose.connect(Mongo_URI).then(
    ()=>{console.log('connected to mongo')}
).catch(
    (err)=>{console.log(err)}
)

//creating server
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth",require('./routes/auth'));
app.use("/api",require("./routes/category"));
app.use("/api/posts",require("./routes/posts"));
app.use("/api/media",require('./routes/media'));
app.use("/api/user",require('./routes/adminUser'));
app.use("/api/website",require('./routes/website'));


app.listen(port,()=>{
    console.log(`Listening on port: ${port}`);
})