import express, { Router } from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoute.js";
import userRoutes from "./routes/userRoute.js";
import friendRoutes from "./routes/friendRoutes.js";
import groupRoutes from './routes/groupRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';

dotenv.config();

const app = express();

const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://split-it-new.netlify.app',
    'https://split-it-new.netlify.ap/p'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

const PORT = process.env.PORT;


// Routes
app.use('/api/auth',authRoutes);
app.use('/api/users',userRoutes);
app.use('/api/friends',friendRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/expenses',expenseRoutes);

const con = await mongoose.connect(process.env.MONGO_URI);
console.log(con.connection.host);
app.listen(PORT, () => {
  console.log(`Server started at ${PORT} -`);
});
