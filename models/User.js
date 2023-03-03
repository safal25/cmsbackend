const mongoose = require('mongoose');
const {Schema} = mongoose;

const userSchema=new Schema({
    username : {type : String,required : true},
    email : {type : String,required : true},
    password : {type : String,required : true},
    role : {type : String ,required : true,default : "Subscriber"},
    createdDate : {type : Date,default : Date.now},
    lastUpdatedDate : {type : Date , default : Date.now}
});

const User=mongoose.model('User',userSchema);

module.exports=User;