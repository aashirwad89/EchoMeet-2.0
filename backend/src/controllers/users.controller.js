import httpStatus from "http-status"
import {User} from "../models/users.models.js"
import bcrypt, {hash} from "bcrypt"
import crypto from "crypto"
import { Meeting } from "../models/meeting.model.js";

const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Please provide" });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      let token = crypto.randomBytes(20).toString("hex");
      user.token = token;
      await user.save();
      return res.status(httpStatus.OK).json({ token: token });
    } else {
      return res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (e) {
    return res.status(500).json({ message: `Something went wrong: ${e.message}` });
  }
};


const register = async (req, res)=>{
    const {name , username , password} = req.body

    try{
const existingUser = await User.findOne({username});
if(existingUser){
    return res.status(httpStatus.FOUND).json({message: "User already exists"})
}
const hashPassword  = await bcrypt.hash(password, 10);
const newUser = new User({
    name: name,
    username: username,
    password: hashPassword 
})

await newUser.save();
res.status(httpStatus.CREATED).json({message: "User registered"})
    }catch(e){
res.json({message: `something went wrong ${e}`})
    }
}

const getUserHistory = async(req, res) => {
  const {token} = req.query;

  try {
    const user = await User.findOne({token: token});
    
    if (!user) {
      return res.status(404).json({message: "User not found"});
    }

    // Yaha name_id use karo, user_id nahi
    const meetings = await Meeting.find({name_id: user.username})
      .sort({date: -1}); // Latest first
    
    res.status(200).json(meetings);
  } catch(e) {
    res.status(500).json({message: `Something went wrong ${e}`});
  }
}
const addToHistory = async(req, res)=>{
  const {token, meeting_code} = req.body;
  try{
    const user = await User.findOne({token:token});
    const newMeeting = new Meeting({
      user_id: user.username,
      meeting_code: meeting_code 
    })
    await newMeeting.save()
    res.status(httpStatus.CREATED).json({message: "Added code to history"})
  }catch(e){
    res.json({message: `Something went wrong ${e}`})
  }
}

export {login , register, getUserHistory, addToHistory}