/**
 * Authentication API service
 * Provides methods for user authentication and profile management
 */

const API_URL = 'https://health-connect-backend-umber.vercel.app/api';

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.name - User's name
 * @param {string} userData.email - User's email
 * @param {string} userData.password - User's password
 * @returns {Promise<Object>} User data with token
 */
export const registerUser = async (userData: { name: string; email: string; password: string }) => {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
    }

    return data;
};

/**
 * Login user
 * @param {Object} credentials - User login credentials
 * @param {string} credentials.email - User's email
 * @param {string} credentials.password - User's password
 * @returns {Promise<Object>} User data with token
 */
export const loginUser = async (credentials: { email: string; password: string }) => {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Login failed');
    }

    return data;
};

/**
 * Get user profile
 * @returns {Promise<Object>} User profile data
 */
export const getUserProfile = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
        throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch user profile');
    }

    return data;
};

/**
 * Update user profile
 * @param {Object} profileData - User profile data to update
 * @returns {Promise<Object>} Updated user profile data
 */
export const updateUserProfile = async (profileData: { name?: string; email?: string; password?: string; profileImage?: string }) => {
    const token = localStorage.getItem('token');

    if (!token) {
        throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to update user profile');
    }

    return data;
};

/**
 * Request password reset
 * @param {string} email - User's email
 * @returns {Promise<Object>} Response message
 */
export const requestPasswordReset = async (email: string) => {
    const response = await fetch(`${API_URL}/password/forgot`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to request password reset');
    }

    return data;
};

/**
 * Validate reset token
 * @param {string} token - Reset token
 * @returns {Promise<Object>} Validation result
 */
export const validateResetToken = async (token: string) => {
    const response = await fetch(`${API_URL}/password/reset/${token}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Invalid or expired token');
    }

    return data;
};

/**
 * Reset password with token
 * @param {string} token - Reset token
 * @param {string} password - New password
 * @returns {Promise<Object>} Response message
 */
export const resetPassword = async (token: string, password: string) => {
    const response = await fetch(`${API_URL}/password/reset/${token}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
    }

    return data;
};

/**
 * Update user tier
 * @param {string} tier - The tier to update to (free, lite, or pro)
 * @returns {Promise<Object>} Updated user data
 */
export const updateUserTier = async (tier: 'free' | 'lite' | 'pro') => {
    const token = localStorage.getItem('token');

    if (!token) {
        console.error('No authentication token found when updating tier');
        throw new Error('No authentication token found');
    }

    console.log(`Attempting to update user tier to: ${tier}`);
    console.log(`API URL: ${API_URL}/auth/tier`);

    try {
        const response = await fetch(`${API_URL}/auth/tier`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tier }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Error updating tier:', data);
            throw new Error(data.message || 'Failed to update user tier');
        }

        console.log('Tier updated successfully:', data);
        return data;
    } catch (error) {
        console.error('Error in updateUserTier API call:', error);
        throw error;
    }
};

/**
 * Debug function: Update user tier using debug endpoint
 * @param {string} tier - The tier to update to (free, lite, or pro)
 * @returns {Promise<Object>} Updated user data
 */
export const debugUpdateUserTier = async (tier: 'free' | 'lite' | 'pro') => {
    const token = localStorage.getItem('token');

    if (!token) {
        console.error('Debug: No authentication token found');
        throw new Error('No authentication token found');
    }

    console.log(`Debug: Attempting to update user tier to: ${tier}`);
    console.log(`Debug: API URL: ${API_URL}/auth/tier-debug`);

    try {
        const response = await fetch(`${API_URL}/auth/tier-debug`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tier }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Debug: Error updating tier:', data);
            throw new Error(data.message || 'Failed to update user tier (debug)');
        }

        console.log('Debug: Tier updated successfully:', data);
        return data;
    } catch (error) {
        console.error('Debug: Error in updateUserTier API call:', error);
        throw error;
    }
};

/**
 * Logout user - clears local storage
 */
export const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('geminiTier');
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if authenticated
 */
export const isAuthenticated = () => {
    return localStorage.getItem('isAuthenticated') === 'true' && !!localStorage.getItem('token');
}; 