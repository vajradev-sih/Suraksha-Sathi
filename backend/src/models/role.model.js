import mongoose, { Schema } from "mongoose";

const roleSchema = new Schema(
    {
        rollName: {
            type: String,
            unique: true,
            required: true,
            trim: true,
            index: true
        },
        description: {
            type: String,
            required: true,
            trim: true,
            default: ''
        }
    }, 
    {
        timestamps: true
    }
)

export const Role = mongoose.model("Role", roleSchema)