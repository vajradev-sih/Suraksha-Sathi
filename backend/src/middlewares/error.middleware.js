// Import ApiError class to check if thrown error is our custom error
import { ApiError } from '../utils/ApiError.js'

// Export error handler middleware function
// Takes 4 parameters: err (error object), req (request), res (response), next (next middleware)
export const errorHandler = (err, req, res, next) => {
    
    // Declare variables to store error details
    let statusCode;
    let message;
    let errors;

    // Check if the error is an instance of our custom ApiError class
    if (err instanceof ApiError) {
        // If YES: Use the custom error properties we defined
        statusCode = err.statusCode;
        message = err.message;
        errors = err.errors;
    } else {
        // If NO: This is an unexpected error, use generic 500 error
        statusCode = 500;
        message = "Internal Server Error";
        errors = [];
    }

    // Create the response object with consistent structure
    const response = {
        success: false,           // Always false for errors
        statusCode: statusCode,    // HTTP status code (400, 404, 500, etc.)
        message: message,          // Error message for client
        errors: errors,            // Additional error details (validation errors, etc.)
    };

    // Only include stack trace in development environment for debugging
    // Never expose stack traces in production (security risk)
    if (process.env.NODE_ENV === 'development') {
        response.stack = err.stack;
    }

    // Send the JSON response with appropriate status code
    res.status(statusCode).json(response);
}
