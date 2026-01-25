export const checkIsEducationAccount = () => {
  try {
    const userDataStr = localStorage.getItem('user_data');

    if (!userDataStr) return false;

    const userData = JSON.parse(userDataStr);

    return userData.isEducationAccount === true;
    
  } catch (error) {
    console.error("Error parsing user_data to check account type:", error);
    return false;
  }
};