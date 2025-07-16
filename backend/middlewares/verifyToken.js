import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { decode } from "punycode";
dotenv.config();

const verifyToken = (req, res, next)=>{
    const authHeader = req.headers.authorization;
    //e shikojm a ekziston autheheader nese jo e lejm default me startu me beareer 
    if(!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(403).json({ message: "Token mungon ose është i pavlefshëm" });
    }

    const token = authHeader.split(" ")[1];// mesazhi i kthym esht bearer=tokeni ky  e ndan ket e merr vetem pjesen e tokenit t paster 
   try{
    // e verifikojm otkenin nga dotenv 
    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    // e ruajm userin me decoded rolin dhe id 
    req.user = {// ruaj info për userin në req.user
      userId: decoded.userId,
      role: decoded.role
    };
    next();
   }catch(error){
    return res.status(401).json({ message: "Token i pavlefshëm ose i skaduar" });
    }
}
export default verifyToken;







