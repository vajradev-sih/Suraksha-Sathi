import { User } from "../models/user.model.js";
import { asyncHandler } from '../utils/AsyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import jwt from 'jsonwebtoken'


const generateAccessAndRefreshTokens = async (userId) => {
    try {
        // Fetch user and populate role_id for use in verifyJWT
        const user = await User.findById(userId)
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}


const registerUser = asyncHandler(async (req, res) => {

    const { email, userName, fullName, password, phone, language_pref } = req.body

    // --- CORRECTED VALIDATION LOGIC ---
    const requiredFields = { email, userName, fullName, password, phone, language_pref };
    for (const key in requiredFields) {
        if (!requiredFields[key] || requiredFields[key].toString().trim() === "") {
            throw new ApiError(400, `${key} is required`) // Correctly uses 'key'
        }
    }
    // ------------------------------------

    const existingUser = await User.findOne({
        $or: [{ userName }, { email }]
    })


    if (existingUser) {
        throw new ApiError(409, `User with this email or username already exists`)

    }

    const user = await User.create({
        fullName,
        email,
        userName: userName.toLowerCase(),
        phone,
        language_pref,
        password
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )
}
)

const loginUser = asyncHandler(async (req, res) => {

    const { email, userName, password } = req.body

    if (!(email || userName)) {
        throw new ApiError(400, `Username or email is required`)
    }

    const user = await User.findOne({
        $or: [{ userName }, { email }]
    }).populate('role_id') // Populate role for consistent context if needed later

    if (!user) {
        throw new ApiError(404, `User does not exist`)

    }

    const isPasswordvalid = await user.isPasswordCorrect(password)

    if (!isPasswordvalid) {
        throw new ApiError(401, "Invalid user credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    // --- ADDED AWAIT ---
    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    // -------------------

    const options = {
        httpOnly: true,
        secure: true
    }


    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User logged in successfully"
            )
        )
}
)

// In backend/src/controllers/user.controller.js (logoutUser function)

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user.id,
        {
            // === FINAL FIX: Use $unset to explicitly remove the field from the DB ===
            $unset: {
                refreshToken: 1 
            }
            // =========================================================================
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"))
})

const refreshAccesToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid refresh Token")
        }

        if (incomingRefreshToken != user?.refreshToken) {
            throw new ApiError(401, "Refresh token expired or used")
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        // --- CORRECTED VARIABLE USAGE ---
        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken }
                )
            )
        // -------------------------------
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body

    const user = await User.findById(req.user?.id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    // --- REMOVED validateBeforeSave: false to enforce password model validation ---
    await user.save()
    // -----------------------------------------------------------------------------

    return res
        .status(200)
        .json
        (
            new ApiResponse(200, {}, "Password changed successfully")
        )
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(200, req.user, "Current user fetched successfully")
        )
})

const updateAccoundDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body

    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName: fullName,
                email: email
            }
        },
        { new: true }

    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account details updated successfully"))
})


// ============================================
// ADMIN/MANAGER CRUD FUNCTIONS (IMPLEMENTED)
// ============================================

/**
 * Admin function to create a user, typically with an assigned role.
 * Role ID is mandatory here for Admin creation.
 */
const createUser = asyncHandler(async (req, res) => {
    const { email, userName, fullName, password, phone, language_pref, role_id } = req.body;

    // Stronger validation for required fields
    const requiredFields = { email, userName, fullName, password, phone, language_pref, role_id };
    for (const key in requiredFields) {
        if (!requiredFields[key] || requiredFields[key].toString().trim() === "") {
            throw new ApiError(400, `${key} is required`);
        }
    }

    const existingUser = await User.findOne({ $or: [{ userName }, { email }] });
    if (existingUser) {
        throw new ApiError(409, `User with this email or username already exists`);
    }

    // The password validation (min length, special chars) is handled by the model's pre-save hook.
    const user = await User.create({
        fullName,
        email,
        userName: userName.toLowerCase(),
        phone,
        language_pref,
        password,
        role_id // Assign the role during creation
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken").populate('role_id');

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User created successfully by Admin")
    );
});


/**
 * Admin/Manager function to fetch all users with optional pagination.
 */
const getAllUsers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [users, totalUsers] = await Promise.all([
        User.find()
            .select("-password -refreshToken")
            .populate('role_id')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }),
        User.countDocuments()
    ]);

    const totalPages = Math.ceil(totalUsers / limit);

    return res.status(200).json(
        new ApiResponse(200, {
            users,
            pagination: { page, limit, totalPages, totalUsers }
        }, "Users fetched successfully")
    );
});


/**
 * Admin/Manager function to fetch a single user by ID.
 */
const getUserById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await User.findById(id).select("-password -refreshToken").populate('role_id');

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(new ApiResponse(200, user, "User fetched successfully"));
});


/**
 * Admin/Manager function to update a user's details (e.g., name, email, phone, role).
 */
const updateUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { fullName, email, phone, language_pref, role_id } = req.body;

    const updates = {};
    if (fullName) updates.fullName = fullName;
    if (email) updates.email = email;
    if (phone) updates.phone = phone;
    if (language_pref) updates.language_pref = language_pref;
    if (role_id) updates.role_id = role_id; // Update role

    if (Object.keys(updates).length === 0) {
        throw new ApiError(400, "Nothing to update");
    }

    // Note: Password update should ideally be handled via a separate endpoint/function.
    const updatedUser = await User.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true, runValidators: true }
    ).select("-password -refreshToken").populate('role_id');

    if (!updatedUser) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(new ApiResponse(200, updatedUser, "User details updated successfully"));
});


/**
 * Admin function to delete a user by ID.
 */
const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // TODO: Before deleting, ensure any related records (Tasks, Reports, etc.) 
    // are either reassigned, anonymized, or deleted to maintain data integrity.

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(new ApiResponse(200, {}, "User deleted successfully"));
});


// ... (Keep existing exports in user.controller.js)
export {
    // ... all existing auth functions
    registerUser,
    loginUser,
    logoutUser,
    refreshAccesToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccoundDetails,
    // Admin CRUD exports
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
}