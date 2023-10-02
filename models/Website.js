const mongoose=require('mongoose');
const {Schema} = mongoose;


const siteSchema = new Schema({
    page : {type : String,required : true},
    title : {type : String,required: true, max : 10},
    subTitle : {type : String,max : 20},
    featuredImage : {type : Schema.Types.ObjectId,ref : "Image"}
},{timestamps : true});

const Website = mongoose.model('Website',siteSchema);

module.exports = Website;


