const mongoose=require('mongoose');
const {Schema}=mongoose;

const commentSchema =  new Schema({
    content : {type : String,required : true, max : 2000},
    postedBy : {type : Schema.Types.ObjectId , ref : "User"},
    postId : {type : Schema.Types.ObjectId, ref : "Post"}
    },  {timestamps : true});

module.exports=mongoose.model("Comments",commentSchema);