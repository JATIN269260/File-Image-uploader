const express=require('express');
const bodyParser=require('body-parser');
const multer=require('multer');
const path=require('path');
const mongodb=require('mongodb');
const fs=require('fs');

  

const app=express();

//use th middleware of body-pareser
app.use(bodyParser.urlencoded({extended:true}))


var storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'uploads');
    },
    filename:function(req,file,cb){
        cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
})

var upload=multer({    //initalizing the storage //invoking the multer function
    storage:storage    //storage variable and initalzing it to he custom storge we designed 
});

//configuring mongodb
const mongoClient =mongodb.MongoClient;
const url="mongodb://localhost:27017";
mongoClient.connect(url,{
    useUnifiedTopology:true,useNewUrlParser:true
},(err,client)=>{
    if(err) return console.log(err) ;

    db=client.db("images");
    app.listen(3000,()=>{
        console.log("mongodb server listening at port 3000")
    })
})

//configuring the home routes

app.get('/',(req,resp)=>{
    resp.sendFile(__dirname+"/index.html")
})

//configurong the upload file route
app.post('/uploadFile',upload.single("myFile"),(req,resp,next)=>{
    const file=req.file;

    if(!file){
        const error= new Error("Please upload a file");
        console.log(file);
        ErrorEvent.http.statusCode=400;
        return next(error);
    }

    resp.send(file);
})


//config the multiple files route

app.post('/uploadMultiple',upload.array("myFiles",12),(req,resp,next)=>{
    const files =req.files;

    if(!files){
        const error =new Error("pleae choose files");
        error.httpStatusCode=400;
        return next(error);
    }

    resp.send(files);
})


//config the image upload to the database

app.post('/uploadImage',upload.single("myImage"),(req,resp)=>{
    
    var img= fs.readFileSync(req.file.path);

    var encode_image=img.toString('base64');

    //define a json object for the image 

    var finalImg={
        contentType:req.file.mimetype,
        path:req.file.path,
        Image:new Buffer(encode_image,'base64')
    };

    // insert image to database

    db.collection('image').insertOne(finalImg,(err,result)=>{
        // console.log(result);

        if(err) return console.log(err);

        console.log("Saved to database");

        resp.contentType(finalImg.contentType);

        resp.send(finalImg.Image);
    })
})

app.listen(4000,()=>{
    console.log("server starts at port 4000");
})



