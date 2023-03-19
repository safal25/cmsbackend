const mongoose=require("mongoose");

const {Schema}=mongoose;


const imageSchema=new Schema({

    url : {type : String, required : true},
    postedBy : {type : Schema.Types.ObjectId}
},{timestamps : true});

const Image=mongoose.model('Image',imageSchema);

module.exports=Image;