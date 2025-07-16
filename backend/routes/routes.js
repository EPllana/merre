import express from "express";
import {registerUser,loginUser, getAllUsers, deleteUser, updateUser,getOneUser,uploadDocs,verifyUserByAdmin,updateLocation,getAllDocs,deleteUserDocsById,changePassword } from "../controller/user.js";
import { verifyEmail }  from "../controller/verifyEmail.js";
import jwt from "jsonwebtoken";
import verifyToken from "../middlewares/verifyToken.js";
import { upload } from "../middlewares/uploadMiddleware.js";
import { getOperationPoints } from "../controller/operationPoints.js";
import { addReviewToWorker, updateReview, deleteReview,getAllWorkersReviews,getWorkers } from "../controller/review.js";




const router = express.Router();

//===============updateLocation ====================/
router.put("/user/location", verifyToken, updateLocation);

//===============Register/Login/GetUsers ====================/

router.post("/register", registerUser);
router.post("/login",loginUser)
router.get("/user",verifyToken, getAllUsers,);

router.delete("/user/:id", verifyToken, deleteUser)
router.put("/user/:id",verifyToken,updateUser)
router.get("/user/:id",verifyToken,getOneUser);

router.put("/user/:id/changepassword",verifyToken,changePassword)


//==============Email Verefication===============//
router.get("/verify-email", verifyEmail);



//=================Upload Docs==================//
router.post("/user/:id/upload-docs",
  verifyToken,
  upload.fields([
    { name: "idDocument", maxCount: 1 },
    { name: "selfie", maxCount: 1 }
  ]),
  uploadDocs
);

router.get("/users/getAllDocs", verifyToken, getAllDocs);
router.delete("/users/:id/docs", verifyToken, deleteUserDocsById);



//===============verifyUserByAdmin ====================/
router.put("/user/:id/verify", verifyToken, verifyUserByAdmin);


//===============getOperationPoints ====================/
router.get("/operation-points", getOperationPoints);


//===============addReviewToWorker ====================/
router.post("/worker/:id/review", verifyToken, addReviewToWorker);
router.get("/worker/review", verifyToken, getAllWorkersReviews);
router.put("/worker/review/:id", verifyToken, updateReview);
router.delete("/worker/review/:id", verifyToken, deleteReview);


//punetoret
router.get("/workers", verifyToken, getWorkers);




export default router;