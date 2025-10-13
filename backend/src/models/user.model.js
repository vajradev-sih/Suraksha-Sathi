import mongoose, { Schema } from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const userSchema = new Schema(
    {
        userName: {
            type: String,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                'Please provide a valid email address'
            ]
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            validate: {
                validator: function (v) {
                    const passwordRegex =
                        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
                    return passwordRegex.test(v);
                },
                message:
                    'Password must be at least 8 characters long and include one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).'
            }
        },
        phone: {
            type: String,
            match: [
                /^\+?(\d{1,3})?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/,
                'Please fill a valid phone number'
            ]
        },
        language_pref: {
            type: String,
            default: 'en',
            enum: ['en', 'hn', 'other_supported_language']
        },

        // ✅ Role reference (optional, properly configured)
        role_id: {
            type: Schema.Types.ObjectId,
            ref: 'Role',
            required: false,
            default: null
        },

        // ✅ Virtual field to expose readable role name (fallback: "Citizen")
        role_name: {
            type: String,
            default: 'Worker'
        },

        refreshToken: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

//
// 🔑 Automatically sync role_name before saving (based on role_id)
//
userSchema.pre('save', async function (next) {
    // Hash password if changed
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }

    // If a role is assigned, fetch its name
    if (this.role_id) {
        const Role = mongoose.model('Role');
        const roleDoc = await Role.findById(this.role_id);
        if (roleDoc) {
            this.role_name = roleDoc.roleName;
        } else {
            this.role_name = 'Worker'; // fallback
        }
    } else {
        this.role_name = 'Worker'; // fallback
    }

    next();
});

//
// 🔐 Instance methods
//
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = async function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            userName: this.userName,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
};

userSchema.methods.generateRefreshToken = async function () {
    return jwt.sign(
        { _id: this._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
};

export const User = mongoose.model('User', userSchema);
