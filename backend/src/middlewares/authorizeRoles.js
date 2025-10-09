import { ApiError } from '../utils/ApiError.js';

/*
 * Middleware to authorize user roles.
 * 
 * @param {...string} allowedRoles - List of role names allowed to access the route.
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const user = req.user; // Assuming req.user is set by verifyJWT middleware after token validation
    
    if (!user || !user.role) {
      return next(new ApiError(401, 'Unauthorized: No user role found'));
    }

    if (!allowedRoles.includes(user.role.name)) {
      return next(new ApiError(403, 'Forbidden: Insufficient role privileges'));
    }

    next();
  };
};
