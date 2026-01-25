/**
 * Utility functions for checking residential status
 * Only Singapore Citizens can access account balance features
 */

/**
 * Check if the user is a Singapore Citizen based on residential status
 * @param {string} residentialStatus - The residential status from user profile
 * @returns {boolean} - True if user is Singapore Citizen, false otherwise
 */
export const isSingaporeCitizen = (residentialStatus) => {
  if (!residentialStatus) return false;
  
  // Handle different possible formats
  const status = residentialStatus.toLowerCase().replace(/\s+/g, '');
  
  return status === 'singaporecitizen' || 
         status === 'singapore citizen' ||
         status === 'sc';
};

/**
 * Check if user has access to account balance features
 * @param {object} profileData - The user profile data
 * @returns {boolean} - True if user can access account balance
 */
export const canAccessAccountBalance = (profileData) => {
  return isSingaporeCitizen(profileData?.residentialStatus);
};
