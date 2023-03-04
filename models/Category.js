const mongoose=require('mongoose');
const {Schema}=mongoose;

const categorySchema=new Schema({
    name :{ type : String,required : true},
    slug : {type : String,required : true,lowercase : true}
},{timestamps : true});

const category=mongoose.model('category',categorySchema);

module.exports=category;