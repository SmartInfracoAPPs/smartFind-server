import mongoose from "mongoose";

const BaseStationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    location: {
        type: { type: String, default: "Point" }, // Assuming you're using GeoJSON format
        coordinates: {
            type: [Number],
            index: "2dsphere", // Create a 2dsphere index for efficient geospatial queries
        },
    },
    radius: {
        type: Number,
        required: true,
    },
});

export default BaseStationSchema;
