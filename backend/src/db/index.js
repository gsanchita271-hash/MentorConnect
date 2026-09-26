import mongoose from 'mongoose';
import { DB_NAME } from '../constants.js'

const connectDB = async(req, res ) => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`MONGODB Connected successfully !!: ${connectionInstance.connection.host}`);
        
    } catch(err) {

        console.log(`MONGODB CONNECTION FAILED: ${err}`);
        
        res.status(400).json({
            success: false,
            message: err.message
        })
    }
}

export { connectDB };

