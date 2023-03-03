const mongoose=require('mongoose');
const {Schema}=mongoose;

const tokenSchema=new Schema({
    userId : {type : Schema.Types.ObjectId,required : true},
    code : {type : String , required :true},
    createdAt : {type : Date,default : Date.now,expires : 3600}
});

const Token=mongoose.model('Token',tokenSchema);

module.exports=Token;