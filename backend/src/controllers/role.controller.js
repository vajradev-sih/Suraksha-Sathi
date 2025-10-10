import { Role } from "../models/role.model.js"
import { User } from "../models/user.model.js";
import { asyncHandler } from '../utils/AsyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'

const createRole = asyncHandler(async (req, res) => {

    const { roleName, description } = req.body

    if (!roleName || !description) {
        throw new ApiError(400, "Role name and description are required");
    }

    const existingRole = await Role.findOne({ roleName })

    if (existingRole) {
        throw new ApiError(409, "Role with this name already exists");
    }

    const role = await Role.create({
        roleName,
        description
    })

    return res
        .status(201)
        .json(new ApiResponse(201, role, "Role created successfully"));

})

const getAllRoles = asyncHandler(async (req, res) => {
    // Define configuration constants
    const defaultLimit = 10;
    const maxLimit = 50; // Enforce a max limit

    // --- Input Validation and Sanitization ---
    // 1. Page validation
    let page = parseInt(req.query.page) || 1;
    if (page < 1) {
        page = 1;
    }

    // 2. Limit validation and clamping
    let limit = parseInt(req.query.limit) || defaultLimit;
    if (limit < 1) {
        limit = defaultLimit;
    } else if (limit > maxLimit) {
        limit = maxLimit; // Clamp the limit
    }

    // Calculate how many records to skip
    const skip = (page - 1) * limit;

    // Fetch roles with pagination and get total count concurrently
    const [roles, totalRoles] = await Promise.all([
        Role.find()
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }), // Sort by newest first

        Role.countDocuments()
    ]);

    // Calculate total pages
    const totalPages = Math.ceil(totalRoles / limit);

    // Return response with roles and pagination info
    return res
        .status(200)
        .json(new ApiResponse(200, {
            roles,
            pagination: {
                currentPage: page,
                totalPages,
                totalRoles,
                limit
            }
        }, "Roles fetched successfully"));
});


const getRoleById = asyncHandler(async (req, res) => {
    const { id } = req.params

    // Find role in database by ID
    const role = await Role.findById(id);

    // Check if role exists
    if (!role) {
        throw new ApiError(404, "Role not found");
    }

    // Return role data
    return res
        .status(200)
        .json(new ApiResponse(200, role, "Role fetched successfully"));
})


const updateRole = asyncHandler(async (req, res) => {

    // Extract role ID from URL parameters
    const { id } = req.params;

    // Extract update data from request body
    const { roleName, description } = req.body;

    // Validate at least one field is provided for update
    if (!roleName && !description) {
        throw new ApiError(400, "At least one field (roleName or description) is required");
    }

    // Build update object with only provided fields
    const updateData = {};
    if (roleName) updateData.roleName = roleName;
    if (description) updateData.description = description;

    // Find and update role in database
    // Options: new: true (return updated document), runValidators: true (run schema validation)
    const updatedRole = await Role.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
    );

    // Check if role exists
    if (!updatedRole) {
        throw new ApiError(404, "Role not found");
    }

    // Return updated role data
    return res
        .status(200)
        .json(new ApiResponse(200, updatedRole, "Role updated successfully"));
});


const deleteRole = asyncHandler(async (req, res) => {
    
    // Extract role ID from URL parameters
    const { id } = req.params;

    // Check if any users are assigned to this role
    // IMPORTANT: Prevent deleting roles that are in use (data integrity)
    const userCount = await User.countDocuments({ role_id: id });

    if (userCount > 0) {
        throw new ApiError(
            400, 
            `Cannot delete role. ${userCount} user(s) are assigned to this role. Reassign users first.`
        );
    }

    // Delete the role from database
    const deletedRole = await Role.findByIdAndDelete(id);

    // Check if role existed
    if (!deletedRole) {
        throw new ApiError(404, "Role not found");
    }

    // Return success response
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Role deleted successfully"));
});


// Export all controller functions for use in routes
export {
    createRole,
    getAllRoles,
    getRoleById,
    updateRole,
    deleteRole
}
