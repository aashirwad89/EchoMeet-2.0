import Express from "express";
import {createServer} from 'node:http'
import mongoose from "mongoose";
import { connectToSocket } from "./controllers/socketManger.js";
import cors from "cors"
import userRoutes from "./routes/users.route.js"




const app = Express();
const server = createServer(app);
const io = connectToSocket(server);

app.set("port", (process.env.PORT || 8000))
app.use(cors());
app.use(Express.json({limit: "40kb"}));
app.use(Express.urlencoded({limit:"40kb", extended:true}))
app.use("/api/v1/users", userRoutes);





const start = async () =>{
    const connectionDb = await mongoose.connect("mongodb+srv://aashirwad_user:LY00OILaxNTEa2lb@echomeet.ntfjscz.mongodb.net/?retryWrites=true&w=majority&appName=EchoMeet")
    console.log("Database is connected")
server.listen(app.get("port"), ()=>{
    console.log("Server is running on port")
});
}
start();