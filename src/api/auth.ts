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

    console.log('Profile update starting:', {
        hasName: !!profileData.name,
        hasEmail: !!profileData.email,
        hasPassword: !!profileData.password,
        hasImage: !!profileData.profileImage,
        imageSize: profileData.profileImage ? Math.round(profileData.profileImage.length / 1024) + 'KB' : 'none'
    });

    try {
        // If the profile image is very large, we'll use a chunked approach or reduce quality further
        let data = profileData;

        // Check if image is extremely large and might cause API issues
        if (profileData.profileImage && profileData.profileImage.length > 1.5 * 1024 * 1024) {
            console.log('Very large image detected, using alternative approach');
            // Create a copy without the image for safety
            const { profileImage, ...basicData } = profileData;

            // First update the basic info
            const basicResponse = await fetch(`${API_URL}/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(basicData),
            });

            if (!basicResponse.ok) {
                const errorData = await basicResponse.json();
                throw new Error(errorData.message || 'Failed to update basic profile data');
            }

            // Now try to reduce the image quality further if needed
            let finalImage = profileImage;
            if (profileImage.length > 800 * 1024) {
                // Create a very small version of the image
                const img = new Image();
                img.src = profileImage;
                await new Promise((resolve) => {
                    img.onload = resolve;
                });

                const canvas = document.createElement('canvas');
                // Limit to a very small size
                const MAX_SIZE = 600;
                const scale = Math.min(MAX_SIZE / img.width, MAX_SIZE / img.height);
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;

                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

                // Use very low quality
                finalImage = canvas.toDataURL('image/jpeg', 0.2);
                console.log('Image reduced to:', Math.round(finalImage.length / 1024) + 'KB');
            }

            // Now update just the image
            const imageResponse = await fetch(`${API_URL}/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ profileImage: finalImage }),
            });

            if (!imageResponse.ok) {
                throw new Error('Failed to update profile image, but other profile data was updated');
            }

            return await imageResponse.json();
        }

        // Standard approach for smaller images
        const response = await fetch(`${API_URL}/auth/profile`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(profileData),
        });

        const responseData = await response.json();

        if (!response.ok) {
            console.error('API error response:', responseData);
            throw new Error(responseData.message || 'Failed to update user profile');
        }

        console.log('Profile update successful:', responseData);
        return responseData;
    } catch (error) {
        console.error('Error in updateUserProfile:', error);
        throw error;
    }
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

/**
 * Synchronize user tier with backend
 * This ensures the database and local storage have the same tier value
 * @returns {Promise<Object>} Updated user data
 */
export const synchronizeTier = async () => {
    try {
        // Get current tier from local storage
        const currentTier = localStorage.getItem('geminiTier') || 'free';

        // Get user token
        const token = localStorage.getItem('token');

        if (!token) {
            console.error('No authentication token found when synchronizing tier');
            throw new Error('No authentication token found');
        }

        console.log(`Synchronizing tier: Local tier is ${currentTier}`);

        // Update tier in database
        const response = await fetch(`${API_URL}/auth/tier`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tier: currentTier }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Error synchronizing tier:', data);
            throw new Error(data.message || 'Failed to synchronize tier');
        }

        console.log('Tier synchronized successfully:', data);
        return data;
    } catch (error) {
        console.error('Error in synchronizeTier API call:', error);
        throw error;
    }
};

/**
 * Update profile image only - separate from other profile updates
 * @param {string} imageDataUrl - The image data URL to upload
 * @returns {Promise<Object>} Updated user data
 */
export const updateProfileImage = async (imageDataUrl: string) => {
    const token = localStorage.getItem('token');

    if (!token) {
        throw new Error('No authentication token found');
    }

    console.log('Starting profile image upload...');
    console.log(`Image size: ${Math.round(imageDataUrl.length / 1024)}KB`);

    // Only compress further if absolutely necessary
    if (imageDataUrl.length > 80 * 1024) {
        console.warn('Image is large, attempting to optimize further while maintaining quality.');
        try {
            // Create a better quality but smaller image
            const img = new Image();
            img.src = imageDataUrl;

            await new Promise<void>((resolve, reject) => {
                img.onload = () => resolve();
                img.onerror = () => reject(new Error('Failed to load image for final compression'));
            });

            const canvas = document.createElement('canvas');
            // Still reasonable size - 250px
            canvas.width = 250;
            canvas.height = 250 * (img.height / img.width);

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                throw new Error('Could not get canvas context');
            }

            // High quality rendering
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Better quality (20%)
            imageDataUrl = canvas.toDataURL('image/jpeg', 0.2);
            console.log(`Final optimized image size: ${Math.round(imageDataUrl.length / 1024)}KB`);
        } catch (e) {
            console.error('Error performing final optimization:', e);
            // Continue with the original image since this is just a safety step
        }
    }

    try {
        // Try to prevent any unnecessary data in the request
        const response = await fetch(`${API_URL}/auth/profile`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                profileImage: imageDataUrl
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('API error response:', errorData);
            throw new Error(errorData.message || 'Failed to update profile image');
        }

        const data = await response.json();
        console.log('Profile image update successful');
        return data;
    } catch (error) {
        console.error('Error in updateProfileImage:', error);
        throw error;
    }
}; 
