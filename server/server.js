import express from "express";
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser";
import connectDB  from "./config/mongodb.js";
import authRouter from './routes/authRoute.js';
// import transporter from "./config/nodemailer.js";
import userRouter from "./routes/userRoute.js";

const app = express();
const port =  process.env.PORT || 4000 ;

const allowedOrigins = ['http://localhost:5173']

connectDB();

app.use(express.json());
app.use(cookieParser());
// app.use(cors({ origin: allowedOrigins, credentials: true})); // Allow the frontend to send credentials such as cookies, JWT tokens (in cookies), or session data.


app.use(cors({
    origin: allowedOrigins,  // your frontend
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// transporter.verify((err, success) => {
//     if (err) {
//         console.log("SMTP Error:", err);
//     } else {
//         console.log("SMTP Ready");
//     }
// });



app.use('/api/auth', authRouter)

app.use('/api/user', userRouter)

app.listen(port, () => {
    console.log(`Server started on PORT : ${port}`);
});

