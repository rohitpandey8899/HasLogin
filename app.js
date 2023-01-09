/* Test - User login system
Create 2 APIs for logging in any user by using Node, Express and MongoDB.
The 2 APIs are
/login - which will accept email and password. Response with 200 (user exists) or 401 (user does not exist)
/forgot-password - which will accept email address. Response with 200 (email exists ) or 401 (email does not exist)
Store all the requests in MongoDB along with a timestamp. Use the free Mongodb Cloud Cluster for the same.
Add a couple of entries to get 200 responses. */

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcryptjs = require('bcryptjs');

// Create an express app
const app = express();

// Connect to mongoDB using Mongoose
mongoose.connect('mongodb+srv://bunny:mMYIAfaJYCe54uY2@cluster0.h6mhpia.mongodb.net/company?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB!');
});

// Use body-parser to parse request body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Create a schema for User
const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Create a model for User
const User = mongoose.model('User', UserSchema);

// using bcryptjs for secureing password HasingPassword
const securePassword = async (password) => {
    try {

        const passwordHas = await bcryptjs.hash(password, 10);
        return passwordHas;

    } catch (error) {
        res.status(400).send(error.message);
    }
}


// Create a signin API
app.post('/signin',async (req, res) => {

       try {
        const spassword = await securePassword(req.body.password);

        const data = new User({
            email: req.body.email,
            password: spassword,
        });

        const userData = await User.findOne({ email: req.body.email });
        if (userData) {
            res.status(200).send("already exists");
        } else {
            const user_data = await data.save();
            res.status(200).send(user_data);
        }
       } catch (error) {
        res.status(400).send(error.message);
       }
})


//1. login - which will accept email and password. Response with 200 (user exists) or 401 (user does not exist)

// Create a login API
app.post('/login', async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const userData = await User.findOne({ email: email });
        if (userData) {
            const passwordCheck = await bcryptjs.compare(password, userData.password);
            if (passwordCheck) {

                const userResult = {
                    _id: userData._id,
                    email: userData.email,
                    password: userData.password,
                    timestamp: userData.timestamp
                }
                const response = {
                    success: true,
                    msg: 'User Details',
                    data: userResult
                }
                res.status(200).send(response);
            }
            else {
                res.status(401).send({ success: false, msg: 'user does not exist' });
            }
        }
        else {
            res.status(401).send({ success: false, msg: 'user does not exist', data: email });
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// 2. forgot-password - which will accept email address. Response with 200 (email exists ) or 401 (email does not exist)
// Create a forgot-password API
app.post('/forgot-password', (req, res) => {
    const { email } = req.body;

    // Find user in MongoDB
    User.findOne({ email }, (err, user) => {
        if (err) return res.status(500).send(err);

        if (user) {
            return res.status(200).send('Email exists');
        } else {
            return res.status(401).send('Email does not exist');
        }
    });
});

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Server running on port ${port}`));