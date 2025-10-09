import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import jwt from "jsonwebtoken"

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken"
        ).populate('role_id');

        if (!user) {
            throw new ApiError(400, "Invalid Access Token")
        }

        req.user = {
            id: user._id,
            email: user.email,
            role: {
                id: user.role_id._id,
                name: user.role_id.name
            }
        };
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token")
    }
})


// Fetch user and populate role field
// const user = await User.findById(decoded.userId).populate('role_id');
// if (!user) throw new ApiError(401, 'User not found or unauthorized');

// Attach user info & role name to req.user
// req.user = {
//     id: user._id,
//     email: user.email,
//     role: {
//         id: user.role_id._id,
//         name: user.role_id.name
//     }
// };

// next();
// });

