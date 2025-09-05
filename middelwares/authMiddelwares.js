import jwt from "jsonwebtoken";
import { version } from "mongoose";

export const protect = (req, res, next) => {

  const authCode = req.headers["authorization"];
  if (!authCode) return res.status(401).json({ msg: "No token found" });

  const token = authCode.split(" ")[1];
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Invalid token" });
  }
};
