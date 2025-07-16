import User from "../models/User.js"; // rruga e saktë sipas strukturës tënde

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();
    res.status(200).send(`<h1>Email Verified!</h1>
     <p>Thank you, <strong>${user.name}</strong>. Your email has been verified successfully.</p>`)
    

  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({ message: "Verification failed" });
  }
};