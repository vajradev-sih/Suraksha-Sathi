import { ApiError } from '../utils/ApiError.js';

/*
 * Middleware to authorize user roles.
 * 
 * @param {...string} allowedRoles - List of role names allowed to access the route.
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const user = req.user; // Assuming req.user is set by verifyJWT middleware after token validation
    
    console.log('[AUTHORIZE] Checking roles:', { 
      allowed: allowedRoles, 
      userRole: user?.role?.name,
      userRoleName: user?.role_name,
      hasUser: !!user,
      hasRole: !!user?.role
    });
    
    if (!user) {
      console.log('[AUTHORIZE] ERROR: No user found');
      return next(new ApiError(401, 'Unauthorized: No user found'));
    }
    
    if (!user.role) {
      console.log('[AUTHORIZE] ERROR: No role object found');
      return next(new ApiError(401, 'Unauthorized: No user role found'));
    }

    // Get the actual role name from user.role.name or fallback to user.role_name
    const userRoleName = user.role.name || user.role_name;
    
    if (!userRoleName) {
      console.log('[AUTHORIZE] ERROR: No role name found');
      return next(new ApiError(401, 'Unauthorized: Role name not found'));
    }

    // Map TrainingOfficer to SafetyOfficer for backward compatibility
    // This allows both old (SafetyOfficer) and new (TrainingOfficer) role names to work
    const expandedAllowedRoles = [...allowedRoles];
    if (allowedRoles.includes('TrainingOfficer') && !allowedRoles.includes('SafetyOfficer')) {
      expandedAllowedRoles.push('SafetyOfficer');
    }
    if (allowedRoles.includes('SafetyOfficer') && !allowedRoles.includes('TrainingOfficer')) {
      expandedAllowedRoles.push('TrainingOfficer');
    }

    console.log('[AUTHORIZE] Expanded roles:', expandedAllowedRoles, 'User has:', userRoleName);

    if (!expandedAllowedRoles.includes(userRoleName)) {
      console.log('[AUTHORIZE] ERROR: Role not authorized');
      return next(new ApiError(403, `Forbidden: Your role "${userRoleName}" does not have access. Required: ${expandedAllowedRoles.join(', ')}`));
    }

    console.log('[AUTHORIZE] ✓ Authorization passed');
    next();
  };
};
