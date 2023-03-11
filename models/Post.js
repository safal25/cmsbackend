const mongoose= require('mongoose');

const {Schema}=mongoose;


const postSchema=new Schema({
    title : {type : String,required : true},
    content : {type : String},
    categories : [{type : Schema.Types.ObjectId,ref:"Category"}],
    postedBy : {type : Schema.Types.ObjectId,ref : "User"},
    slug : {type : String, lowercase : true,unique : true}
},{timestamps : true});

module.exports=mongoose.model("Post",postSchema);
