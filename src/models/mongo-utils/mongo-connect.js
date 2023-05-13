import mongoose from 'mongoose';

const connectToDatabase =  dbUri => {
    try {
        
      mongoose.connect(dbUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
  
      console.log('Successfully connected to database');
      return mongoose;

    } catch (error) {

      console.error('Error connecting to database:', error);
      throw error;

    }
};

export default connectToDatabase();