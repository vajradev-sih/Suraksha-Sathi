import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    console.log('[AUTH] Starting JWT verification');
    // 1️⃣ Extract access token from cookies or Authorization header
    const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");

    console.log('[AUTH] Token present:', !!token);
    // Immediately reject if no token
    if (!token) {
        throw new ApiError(401, "Unauthorized request: Access Token missing");
    }

    // 2️⃣ Verify and decode token
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if (!decodedToken?._id) {
        throw new ApiError(401, "Invalid Access Token: Missing user identifier");
    }

    // 3️⃣ Fetch user from DB with refreshToken for revocation validation
    // ✅ Fetch user & populate role
    const user = await User.findById(decodedToken._id)
        .select("userName fullName email phone language_pref refreshToken role_id role_name")
        .populate("role_id", "roleName"); // only fetch roleName from Role



    if (!user) {
        throw new ApiError(401, "Invalid Access Token: User not found");
    }

    console.log('[AUTH] User authenticated:', user._id);

    // 4️⃣ Session revocation check (ensures user hasn't logged out)
    if (!user.refreshToken) {
        throw new ApiError(
            401,
            "Invalid Access Token: Session terminated (User logged out)"
        );
    }

    // 5️⃣ Construct req.user (with clean role info)
    req.user = {
        _id: user._id,
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        userName: user.userName,
        phone: user.phone,
        language_pref: user.language_pref,
        role_name: user.role_name || user.role_id?.roleName || "Worker",
        role: user.role_id
            ? {
                id: user.role_id._id,
                name: user.role_id.roleName // ✅ always comes from Role collection
            }
            : {
                id: null,
                name: user.role_name || "Worker" // fallback to user's role_name or Worker
            }
    };

    console.log('[AUTH] Calling next() - auth complete');
    next(); // ✅ continue to the next middleware/controller
});
