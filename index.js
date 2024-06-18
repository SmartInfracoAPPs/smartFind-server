
// import express from 'express';
import BaseStationSchema from './BaseStationSchema.js';
import dbconfig from './dbconfig.js';
import mongoose from "mongoose";
import dotenv from 'dotenv'
import cors from 'cors';
import OrderForm from './OrderFormSchema.js'
import whitelist from './whitelist.js';
import {isWithinRadius } from './distanceFunctions.js';
import nodemailer from 'nodemailer';

dotenv.config();

const transporter = nodemailer.createTransport({
  // Email SMTP settings
  service: `${process.env.SERVICES}`,
  auth: {
    user: `${process.env.GMAIL_MAIL}`,
    pass: `${process.env.GMAIL_SMTP_PASSWORD}`
  }
});

(async () => {
  try {
    const app = await dbconfig();

    const db = mongoose.connection;
    db.on('error', (error) => console.error('MongoDB connection  error:', error));
    db.once('open', () => console.log('Connected to MongoDB'));

    // Define Basestation Schema
    const Basestation = mongoose.model('Basestation', BaseStationSchema);


    const corsOptions = {
      origin: (origin, callback) => {
        if (whitelist.indexOf(origin) !== -1 || !origin) {
          callback(null, true);
        } else {
          callback(new Error('Access denied by CORS'));
        }
      },
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
      optionsSuccessStatus: 200,
    };
    
    app.use(cors(corsOptions));


    app.post('/checkConnectivity', async (req, res, next) => {
      console.log('Received request data:', req.body);
      
      const { clientlatitude, clientlongitude } = req.body;
    
      try {
        const basestations = await Basestation.find({}, 'Latitude Longitude');
      
        for (const basestation of basestations) {
          const { Latitude, Longitude } = basestation._doc;
      
          if (isNaN(Latitude) || isNaN(Longitude)) {
            console.log('Invalid coordinates');
            continue;
          }
      
          const radiusInKm = 10;
          const connectivityStatus = isWithinRadius(clientlatitude, clientlongitude, Latitude, Longitude, radiusInKm);
      
          console.log('Connectivity status:', connectivityStatus);
      
          if (connectivityStatus === 'Network available') {
            req.nLat = Latitude;
            req.nLng = Longitude; // Store the values in the request object
            const responseData = { message: 'Network is Available', coordinates: { nLat: Latitude, nLng: Longitude } };
            console.log('Sending response data:', responseData);
            return res.json(responseData);
          }
        }
      
        const noConnectivityResponse = { message: 'No connectivity' };
        console.log('Sending response data:', noConnectivityResponse);
        res.json(noConnectivityResponse);
      } catch (error) {
        console.error('Error querying basestations:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
    
    


    
    app.post('/submitForm', async (req, res) => {
      try {
        const formData = req.body;
    
        // Configure mail options
        const mailOptions = {
          from: `${formData.email}`,
          to: ['daniel.jojo-koomson@outlook.com,', 'fieldsupport@smartinfraco.com' ,'christian.abbosey@smartinfraco.com', 'd.koomson@smartinfraco.com'],
          subject: 'Network Service Request',
          text: `
            Full Name: ${formData.fullName}
            Contact: ${formData.contact}
            Email: ${formData.email}
            Latitude: ${formData.location.latitude}
            Longitude: ${formData.location.longitude}
          `,
        };
    
        // Send email (handle potential errors gracefully)
        try {
          await transporter.sendMail(mailOptions);
          console.log('Email sent successfully');
          console.log(formData.location)
        } catch (error) {
          console.error('Error sending email:', error);
          throw new Error('Failed to send email'); // Propagate error for proper response
        }
    
        // Save data to MongoDB (handle potential errors gracefully)
        try {
          const savedOrderForm = await OrderForm.create(formData);
          console.log('Form data saved to MongoDB:', savedOrderForm);
        } catch (error) {
          console.error('Error saving form data:', error);
          throw new Error('Failed to save form data'); // Propagate error for proper response
        }
    
        // Respond with success only if both operations are successful
        res.status(200).json({ message: 'Form submitted successfully' });
      } catch (error) {
        // More specific error handling based on error type
        if (error.message.includes('email')) {
          res.status(400).json({ error: 'Email sending failed' });
        } else if (error.message.includes('save')) {
          res.status(500).json({ error: 'Internal server error' }); // More specific message
        } else {
          res.status(500).json({ error: 'An unknown error occurred' });
        }
      }
    });
    
    

    

    app.get('/api/data', (req, res) => {
      const apiKey = process.env.VITE_GOOGLE_API_KEY;
      const mapId = process.env.VITE_GOOGLE_MAP_ID;
      res.json({ message: 'Server received request and processed data.', apiKey, mapId });
    });

    // API Endpoints
    app.post('/basestations', async (req, res) => {
      try {
        const basestation = new Basestation(req.body);
        const savedBasestation = await basestation.save();
        res.json(savedBasestation);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    app.get('/basestations', async (req, res) => {
      try {
        const basestations = await Basestation.find();
        res.json(basestations);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    app.use((err, req, res, next) => {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    });
    
    const PORT =  process.env.PORT;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error configuring the app:', error);
  }
})();
