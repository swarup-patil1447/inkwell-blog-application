require("dotenv").config();
const express=require("express"),fs=require("fs"),path=require("path"),crypto=require("crypto"),bcrypt=require("bcryptjs"),jwt=require("jsonwebtoken");
const app=express(),PORT=process.env.PORT||3000,SECRET=process.env.JWT_SECRET;
if(!SECRET||SECRET.length<32){console.error("Set JWT_SECRET in .env (at least 32 characters).");process.exit(1);}
const dir=path.join(__dirname,"data"),UF=path.join(dir,"users.json"),PF=path.join(dir,"posts.json");
fs.mkdirSync(dir,{recursive:true});for(const f of [UF,PF])if(!fs.existsSync(f))fs.writeFileSync(f,"[]");
const read=f=>{try{return JSON.parse(fs.readFileSync(f,"utf8"))}catch{return[]}},write=(f,x)=>fs.writeFileSync(f,JSON.stringify(x,null,2));
const safeUser=u=>({id:u.id,name:u.name,email:u.email,createdAt:u.createdAt});
const token=u=>jwt.sign({id:u.id,email:u.email},SECRET,{expiresIn:"7d"});
function auth(req,res,next){const h=req.headers.authorization||"",parts=h.split(" ");if(parts[0]!=="Bearer"||!parts[1])return res.status(401).json({message:"Please log in first."});try{const p=jwt.verify(parts[1],SECRET);req.user=read(UF).find(u=>u.id===p.id);if(!req.user)return res.status(401).json({message:"Account not found."});next()}catch{return res.status(401).json({message:"Invalid or expired login token."})}}
function valid(v,name,min,max){if(typeof v!=="string"||v.trim().length<min||v.trim().length>max)return `${name} must be ${min}-${max} characters.`;return null}
app.use(express.json({limit:"100kb"}));app.use(express.static(path.join(__dirname,"public")));
app.get("/api/health",(req,res)=>res.json({status:"ok",service:"InkWell API"}));
app.post("/api/auth/register",async(req,res)=>{const name=String(req.body.name||"").trim(),email=String(req.body.email||"").trim().toLowerCase(),pw=String(req.body.password||"");const err=valid(name,"Name",2,50)||(!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)?"Enter a valid email address.":null)||valid(pw,"Password",8,72);if(err)return res.status(400).json({message:err});const users=read(UF);if(users.some(u=>u.email===email))return res.status(409).json({message:"This email is already registered."});const u={id:crypto.randomUUID(),name,email,passwordHash:await bcrypt.hash(pw,12),createdAt:new Date().toISOString()};users.push(u);write(UF,users);res.status(201).json({message:"Registered successfully.",token:token(u),user:safeUser(u)})});
app.post("/api/auth/login",async(req,res)=>{const email=String(req.body.email||"").trim().toLowerCase(),pw=String(req.body.password||""),u=read(UF).find(x=>x.email===email);if(!u||!(await bcrypt.compare(pw,u.passwordHash)))return res.status(401).json({message:"Email or password is incorrect."});res.json({message:"Logged in.",token:token(u),user:safeUser(u)})});
app.get("/api/auth/me",auth,(req,res)=>res.json({user:safeUser(req.user)}));
app.get("/api/posts",(req,res)=>res.json({posts:read(PF).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt))}));
app.get("/api/posts/mine",auth,(req,res)=>res.json({posts:read(PF).filter(p=>p.authorId===req.user.id).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt))}));
app.post("/api/posts",auth,(req,res)=>{const b=req.body||{},err=valid(b.title,"Title",3,100)||valid(b.excerpt,"Summary",10,180)||valid(b.content,"Content",30,20000),cats=["Ideas","Technology","Learning","Career","Lifestyle","Personal"];if(err||!cats.includes(b.category))return res.status(400).json({message:err||"Choose a valid category."});const p={id:crypto.randomUUID(),title:b.title.trim(),category:b.category,excerpt:b.excerpt.trim(),content:b.content.trim(),author:req.user.name,authorId:req.user.id,createdAt:new Date().toISOString()};const posts=read(PF);posts.push(p);write(PF,posts);res.status(201).json({message:"Story published.",post:p})});
app.delete("/api/posts/:id",auth,(req,res)=>{const posts=read(PF),p=posts.find(x=>x.id===req.params.id);if(!p)return res.status(404).json({message:"Story not found."});if(p.authorId!==req.user.id)return res.status(403).json({message:"You can only delete your own stories."});write(PF,posts.filter(x=>x.id!==p.id));res.json({message:"Story deleted."})});
app.use("/api",(req,res)=>res.status(404).json({message:"API route not found."}));
app.listen(PORT,()=>console.log(`InkWell server running at http://localhost:${PORT}`));
