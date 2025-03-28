// utils/responseTemplates.js

/**
 * Send a standardized successful response.
 *
 * @param {Object} res - Express response object.
 * @param {Object} data - Data to send in the response.
 * @param {string} message - Success message.
 * @param {number} statusCode - HTTP status code (default is 200).
 */
const sendResponse = (res, data = {}, message = "Success", statusCode = 200) => {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  };
  
  /**
   * Send a standardized error response.
   *
   * @param {Object} res - Express response object.
   * @param {Object|string} error - Error object or message.
   * @param {string} message - Error message to send.
   * @param {number} statusCode - HTTP status code (default is 500).
   */
  const sendError = (res, error = {}, message = "An error occurred", statusCode = 500) => {
    // Hide detailed error info in production for security reasons
    const errorDetails = process.env.NODE_ENV === "production" ? {} : error;
    return res.status(statusCode).json({
      success: false,
      message,
      error: errorDetails,
    });
  };
  
  module.exports = { sendResponse, sendError };
  