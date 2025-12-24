const express=require("express");
const fileupload=require("express-fileupload");
const mysql2=require("mysql2");
const path = require("path");           // New Line
require("dotenv").config();   // NEW LINE

const app=express();

console.log("ENV:", process.env.DB_HOST, process.env.DB_USER, process.env.DB_NAME);

app.listen(2007,function()
{
    console.log("Server started at port:2007");
})
app.use(express.static(path.join(__dirname, "public")));
//app.use(express.static("public"));

const configKuch={
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    dateStrings:true,
    timezone: process.env.DB_TIMEZONE
}

const mysql=mysql2.createConnection(configKuch);
mysql.connect(function(err)
{
    if(err==null)
    console.log("Connected Successfully");
    else
    console.log(err.sqlMessage);
})

app.get("/",function(req,resp)
{
   const filePath=__dirname+ "/public/index.html";
   resp.sendFile(filePath);
})
app.get("/hello",function(req,resp)
{
    resp.send("Hi Programmers");
})
 
app.get("/signup-process",function(req,resp)
{
    console.log(req.query);

    let quali="";

    if(req.query.chkB!=undefined)
       quali=req.query.chkB+",";
    if(req.query.chkM!=undefined)
       quali+=req.query.chkM+",";
    if(req.query.chkBt!=undefined)
       quali+=req.query.chkBt;

    let visited=req.query.cityv;
    resp.send("Qualification="+quali+"  Occuptation="+req.query.city+"  Visited Cities="+visited);
})

//-------------URL handlers
app.get("/signup",function(req,resp)
{
    const filePath=__dirname+"/public/signup.html";
    resp.sendFile(filePath);
})

app.get("/signup-secure",function(req,resp)
{
    const filePath=__dirname+"/public/signup-secure.html";
    resp.sendFile(filePath);
    
})

app.use(fileupload());
app.use(express.urlencoded({extended:true}));
app.post("/signup-process-secure",function(req,resp)
{
    //resp.send("welcome:"+req.body.txtEmail);
    console.log(req.files);

    resp.contentType("text/html");
    if(req.files!=null && req.files.ppic!=null)
    {
        let filename=req.files.ppic.name;
        let filepath=process.cwd()+"/public/uploads/"+filename;
        req.files.ppic.mv(filepath);
        resp.write("  *Ppic Uplaoded Successfullyyyy<br>");
    }
    if(req.files!=null && req.files.proof!=null)
    {
        let filename=req.files.proof.name;
        let filepath=process.cwd()+"/public/uploads/"+filename;
        req.files.proof.mv(filepath);
        resp.write("  *Proof Uploaded Successfulyyyy <br>");
    }
    resp.write("Data Saved Successfully");
    resp.end(); 
});

app.post("signup-process-secure",function PreviewImage()
{
    var oFReader= new FileReader();
    oFReader.readAsDataURL(document.getElementById("uploadImage").files[0]);

    oFReader.onload=function(oFREvent) 
    {
     document.getElementById("uploadPreview").src=oFREvent.target.result;
    }
});

//------------------DATABASE Connectivity Code
app.get("/profile-front",function(req,resp)
{
    resp.sendFile(process.cwd()+"/public/profile-db.html");
})


///edit in this processs for update functionand change the update query below 
app.post("/db-profile-process",function(req,resp)
{
    const email=req.body.txtEmail;
    const dob=req.body.dob;
    let filename="nopic.jpeg";

    if(req.files!=null)
    {
        filename=req.body.txtEmail+"-"+req.files.ppic.name;
        const path=process.cwd()+"/public/uploads/"+filename;
        req.files.ppic.mv(path);
        console.log("File Uploaded Successfullyy");
    }
   
    mysql.query("insert into profilesnov values(?,?,?,current_date())",[email,dob,filename],function(err)
    {
            if(err==null)
                resp.send("Records Saved Successfullyy");
            else
                resp.send(err.message);
    });
    
})

app.post("/db-profile-update",function(req,resp)
{
    const email=req.body.txtEmail;
    const dob=req.body.dob;
    let filename="";

    if(req.files!=null)
    {
        filename=req.body.txtEmail+"-"+req.files.ppic.name;
        const path=process.cwd()+"/public/uploads/"+filename;
        req.files.ppic.mv(path);
        console.log("File Uploaded Successfullyy");
    }
    else
    filename=req.body.hdn;
   
   mysql.query("update profilesnov set dob=?,ppic=? where emailid=?",[dob,filename,email],function(err,resTable)
    {
            if(err==null)
            {
                if(resTable.affectedRows==1)
                 resp.send("Record Updated Successfully");
                else
                 resp.send("Invalid ID");
            }
            else
                resp.send(err.message);
    });
    
})


app.post("/db-profile-delete",function(req,resp)
{
    const emailid=req.body.txtEmail;
    mysql.query("delete from profilesnov where emailid=?",[emailid],function(err,result)
    {
        if(result.affectedRows==1)
          resp.send("Deleted")  ;
        else
            resp.send("Invalid ID");
    })
})
app.post("/db-profile-showall",function(req,resp)
{
    mysql.query("select * from profilesnov",function(err,resTable)
    {
        resp.send(resTable);
    })
})

app.get("/chk-email",function(req,resp)
{
    let eml=req.query.emailkuch;
    mysql.query("select * from profilesnov where emailid=?",[eml],function(err,resTable){
        if(err)
        {
            resp.send(err.message);
            return;
        }
        if(resTable.length==1)
           resp.send("Already Taken");
        else
           resp.send("Not Taken, Available");
    })
})

app.get("/fetch-json-record",function(req,resp)
{
    let eml=req.query.emailKuch;
    mysql.query("select * from profilesnov where emailid=?",[eml],function(err,resTable)
    {
        if(err)
        {
            resp.send(err.message);
            return;
        }
        resp.send(resTable);
    });
})

