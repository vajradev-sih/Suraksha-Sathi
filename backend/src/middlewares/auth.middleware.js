import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import jwt from "jsonwebtoken"

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

        if (!token) {
            throw new ApiError(401, "Unauthorized request: Access Token missing")
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        // === FIX 1: Explicitly include all fields needed for profile and security ===
        // We list all non-sensitive fields and 'refreshToken' as inclusions.
        // Mongoose automatically excludes 'password' if configured in the model.
        const user = await User.findById(decodedToken?._id).select(
            "userName fullName email phone language_pref refreshToken" 
        ).populate('role_id');
        // ===========================================================================

        if (!user) {
            throw new ApiError(401, "Invalid Access Token: User not found")
        }

        // Session Revocation Check (Ensure user hasn't logged out)
        if (!user.refreshToken) {
             throw new ApiError(401, "Invalid Access Token: Session terminated (User logged out)")
        }

        // === FIX 2: Safely construct the COMPLETE req.user object ===
        // Populate req.user with all the fetched data fields.
        req.user = {
            id: user._id, // Consistent ID property
            email: user.email,
            fullName: user.fullName,
            userName: user.userName,
            phone: user.phone,
            language_pref: user.language_pref,
            role: user.role_id ? {
                id: user.role_id._id,
                name: user.role_id.rollName // Note: Uses 'rollName' from the Role model
            } : null // Return null if the user has no role assigned
        };
        // ==========================================================

        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token")
    }
})