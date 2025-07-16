import express from "express";
import bcrypt from "bcrypt";
import User from "../models/user.js"; // ose emri i saktë i modelit tënd
import crypto from "crypto";
import { sendVerificationEmail }  from "../utils/sendVerificationEmail.js";
import { skip } from "node:test";
import jwt from "jsonwebtoken"
import verifyToken from "../middlewares/verifyToken.js";
import fs from "fs";
import path from "path";



//===============registerUser ====================/
export const registerUser = async (req, res) => {
  try {
    const { name, surname, email, password, role, phoneNumber } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    if(!password){
      return res.status(404).json({message:"Password Required"})
    }
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const newUser = new User({
      name,
      surname,
      email,
      password: hashedPassword,
      role: role || "user",
      phoneNumber,
      verificationToken,
      isVerified: false
    });

    await newUser.save();
    await sendVerificationEmail({ email, name, verificationToken });

    res.status(201).json({ message: "User created successfully. Check your email to verify.", });
  } catch (error) {
    console.error("Register Error:", error.message);
    res.status(500).json({ message: "Registration failed" });
  }
};

//===============loginUser ====================/
export const loginUser = async (req ,res )=>{
  try{
    const { name, surname, email, password, role, phoneNumber } = req.body;
    const user = await User.findOne({email});
    if(!user){
      return res.status(404).json({message:"user doesn't exist"})
    }
     // kontrollo verifikimin e emailit
     if (!user.isVerified) {
      return res.status(401).json({ message: "Please verify your email first." });
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch){
      return res.status(404).json({message:"Wrong Password"})
    }
    //=====JWT TOKEN=====//
    const token =jwt.sign(//jwt.sign(...): është funksioni që krijon një JWT token.
      { userId: user._id, role: user.role },// //user._id: është ID-ja unike që MongoDB e krijon automatikisht për çdo dokument
       process.env.JWT_SECRET,
      { expiresIn: "1h" }
  );

   // Kthe përgjigjen me token
    res.status(201).json({message:"Logged in successfully",
    token,
    user:{
      id:user._id,
      name:user.name,
      surname:user.surname,
      role:user.role
    }
  });
  
    }catch(error){
      console.error(error); // shfaq gabimin real në terminal
      res.status(500).json({message:"server failed"})
    }

}
//===============getAllUsers ====================/
export const getAllUsers =  async (req, res) => {
  if(req.user.role !== "admin"){
    return res.status(403).json({ message: "ski leje vetem admini mundet " });
  }
    const search = req.query.search;

    const limit = parseInt(req.query.limit) ||10
    const page = parseInt(req.query.page) || 1

    const skip=(page -1 ) * limit;

  let filter={};

  if(search){
    filter.$or=[
      {name:{$regex:search,$options:"i"}},
      {surname:{$regex:search,$options:"i"}},
      {email:{$regex:search,$options:"i"}},
      {role:{$regex:search,$options:"i"}},
      {phoneNumber:{$regex:search,$options:"i"}}

    ]
  }
try{
    const users = await User.find(filter).select("-password").sort({ createdAt: -1 }).limit(limit).skip(skip);
   const totalDocuments = await User.countDocuments(filter)
    res.status(200).json({
      length:users.length,
      data:users,
      totalDocuments:totalDocuments

    });
  } catch (error) {
    console.error("Gabim në server:", error.message);
    res.status(500).json({
      message: "Serveri deshtoi",
      error: error.message,     // e shtojmë për ta parë gabimin e vërtetë
    });
  }
  
};


//===============deleteUser ====================/
export const deleteUser = async (req ,res)=>{
  try{
    const userId = req.params.id;
    const user = await User.findByIdAndDelete(userId);
    if(!user){
      return res.status(400).json({message:"User Doesnt Exist"})
    }
    res.status(201).json({message:"User Deleted Succefully"})
  }catch(error){
        res.status(500).json({message:"Error Message"})
    console.error("Server Failed")
  }
}

//===============updateUser ====================/
export const updateUser = async (req, res)=>{
  try{
    const { name, surname, email, password, role, phoneNumber } = req.body;
    const userId = req.params.id;
    const user = await User.findById(userId);
    if(!user){
      return res.status(404).json({message:"user nuk ekzsiton"})
    }
    if(name)user.name=name;
    if(surname)user.surname= surname;
    if(email)user.email=email;
    if(role)user.role=role;
    if(phoneNumber)user.phoneNumber = phoneNumber;
    await user.save();
    res.status(200).json({ message: "User u përditësua me sukses", user });

  }catch(error){
    console.log("error", error.message)
  }
}
//===============getOneUser ====================/
export const getOneUser = async (req, res)=>{
  try{
  const userId = req.params.id;
  const user = await User.findById(userId);;
  if(!user){
    return res.status(404).json({message:"user nuk ekzsiton"})
  }
  res.status(201).json({message:"useri u gjet me sukes",user})
}catch(error){
  res.status(500).json({message:"serveri deshtoi"})
  console.log("diqka gabim",error.message)
}
}


export const changePassword = async (req, res)=>{
  try{
    const userId = req.params.id;
    const {oldPassword, newPassword}=req.body;
    if(!oldPassword || !newPassword){return res.status(400).json({message:"Old Password And New Password Required"})}

    const user = await User.findById(userId)
    if(!user){ return res.status(400).json({message:"User doesnt exist"})}

    const isOldPasswordVlaid = await bcrypt.compare(oldPassword, user.password)
    if(!isOldPasswordVlaid){return res.status(400).json({message:"Old Password Not Validd"})}


    const hashedPassword = await bcrypt.hash(newPassword, 10)
    user.password = hashedPassword;

    await user.save();

    res.status(200).json({message:"Password Changed Succefully"})
    
  }catch(error){
  res.status(500).json({message:"Serveri Deshtoi", error})

  }
}
//===============UPLOAD DOCUMENTS ====================/
export const uploadDocs = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const idDoc = req.files?.idDocument?.[0]?.path || null;
    const selfie = req.files?.selfie?.[0]?.path || null;

    if (idDoc) user.idDocumentUrl = idDoc;
    if (selfie) user.selfieUrl = selfie;
    await user.save();

    res.status(200).json({
      message: "Documents uploaded successfully",
      idDocumentUrl: user.idDocumentUrl,
      selfieUrl: user.selfieUrl
    });
  } catch (error) {
    console.error("Upload failed", error);
    res.status(500).json({ message: "Upload failed" });
  }
};
//===============getAllDocs ====================/

export const getAllDocs = async (req, res) => {
  try {
    // Gjej user-at që kanë dokumente të ngarkuara (një nga të dy fushat jo null)
    const usersWithDocs = await User.find({
      $or: [
        { idDocumentUrl: { $ne: null } },
        { selfieUrl: { $ne: null } }
      ]
    }).select("idDocumentUrl selfieUrl name email"); // për shembull merr edhe emrin/emailin

    res.status(200).json(usersWithDocs);
  } catch (error) {
    console.error("Failed to get all documents", error);
    res.status(500).json({ message: "Failed to get all documents" });
  }
};


//===============deleteDocs ====================/


export const deleteUserDocsById = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.idDocumentUrl) {
      fs.unlink(path.resolve(user.idDocumentUrl), (err) => {
        if (err) console.error("Error deleting idDocument file:", err);
      });
      user.idDocumentUrl = null;
    }

    if (user.selfieUrl) {
      fs.unlink(path.resolve(user.selfieUrl), (err) => {
        if (err) console.error("Error deleting selfie file:", err);
      });
      user.selfieUrl = null;
    }

    await user.save();

    res.status(200).json({ message: "User documents deleted successfully" });
  } catch (error) {
    console.error("Failed to delete user documents:", error);  // <-- LOG MË I DETAJUAR
    res.status(500).json({ message: "Failed to delete user documents", error: error.message });
  }
};


//===============verifyUserByAdmin ====================/
export const verifyUserByAdmin = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Vetëm admini mundet me verifiku përdorues." });
    }

    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User nuk u gjet" });

    user.isVerifiedByAdmin = true;
    await user.save();

    res.status(200).json({ message: "Përdoruesi u verifikua me sukses nga admini." });
  } catch (error) {
    console.error("Gabim në verifikim:", error.message);
    res.status(500).json({ message: "Serveri dështoi gjatë verifikimit." });
  }
};
//================updateLocation====================/
export const updateLocation = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { city, lat, lng } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.location = {
      city,
      coordinates: {
        lat,
        lng,
      },
    };

    await user.save();

    res.status(200).json({ message: "Lokacioni u përditësua me sukses", location: user.location });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
//================getWorkerReviews====================/


