import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import router from "./routes/auth";
import userRoutes from "./routes/users";
import { register} from "./controllers/auth";
import {createPost} from "./controllers/posts"
import { verifyToken } from "./middleware/auth";
import User from "./models/User";
import Post from "./models/Post";
import {users, posts} from "./data/index";

/*configuration*/
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({policy:"cross-origin"}));
app.use(morgan("common"));
app.use(bodyParser.json({limit: "30mb", extended:true}));
app.use(bodyParser.urlencoded({limit: "30mb", extended: true}));
app.use(cors());
app.use("/assets", express.static(path.join(__dirname, 'public/assets')));

/*FILE STORAGE */
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/assets");
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({storage});

/*Routes with files*/
app.post("/auth/register", upload.single("picture"), verifyToken, register);
app.post("/post", verifyToken, upload.single("picture"), createPost);

/* ROUTES */
app.post("auth", authRoutes);
app.use("/users", userRoutes);


/*mongoose setup*/
const PORT = process.env.port || 6001;
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    app.listen(PORT, () => console.log(`Server Port: ${PORT}`));

    /*Add this data one time */
    User.insertMany(users);
    Post.insertMany(posts);
}).catch((error) => console.log(`${error} did not connect`));