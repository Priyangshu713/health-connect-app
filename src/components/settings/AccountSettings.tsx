import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { User, Upload, X, Camera, Zap } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { getUserProfile, updateUserProfile, synchronizeTier, updateProfileImage } from '@/api/auth';
import { useHealthStore } from '@/store/healthStore';

// Form schema
const profileSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters long' }),
});

interface AccountSettingsProps {
    isOpen: boolean;
    onClose: () => void;
}

type ProfileData = {
    name: string;
    email: string;
    tier: string;
    profileImage?: string;
    createdAt: string;
};

const AccountSettings: React.FC<AccountSettingsProps> = ({ isOpen, onClose }) => {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isSynchronizing, setIsSynchronizing] = useState(false);
    const { geminiTier } = useHealthStore();

    // Form setup
    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: '',
        },
    });

    // Fetch user profile data
    useEffect(() => {
        if (isOpen) {
            fetchProfileData();
        }
    }, [isOpen]);

    const fetchProfileData = async () => {
        setIsLoading(true);
        try {
            // First, try to synchronize the tier
            await synchronizeTierWithBackend();

            const data = await getUserProfile();
            setProfileData({
                name: data.name,
                email: data.email,
                tier: data.tier,
                profileImage: data.profileImage,
                createdAt: data.createdAt
            });
            form.setValue('name', data.name);
            setProfileImage(data.profileImage || null);
        } catch (error) {
            console.error('Error fetching profile data:', error);
            toast({
                title: 'Error',
                description: 'Failed to load account settings',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const synchronizeTierWithBackend = async () => {
        setIsSynchronizing(true);
        try {
            // Only synchronize if user has a tier set in localStorage
            const localTier = localStorage.getItem('geminiTier');
            if (localTier) {
                console.log(`Attempting to synchronize tier: ${localTier}`);
                await synchronizeTier();
                toast({
                    title: 'Tier Synchronized',
                    description: `Your ${localTier.charAt(0).toUpperCase() + localTier.slice(1)} tier has been synchronized with the server.`,
                });
            }
        } catch (error) {
            console.error('Error synchronizing tier:', error);
            // Don't show error toast here to not interrupt the user experience
        } finally {
            setIsSynchronizing(false);
        }
    };

    const createTinyAvatar = (letter: string, color: string = '#4f46e5') => {
        // Create a tiny canvas for simple text avatar
        const canvas = document.createElement('canvas');
        canvas.width = 60;
        canvas.height = 60;
        const ctx = canvas.getContext('2d');

        if (!ctx) return null;

        // Draw background
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 60, 60);

        // Draw text
        ctx.fillStyle = 'white';
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(letter.toUpperCase(), 30, 30);

        // Convert to very small JPEG
        return canvas.toDataURL('image/jpeg', 0.01);
    };

    const onSubmit = async (values: z.infer<typeof profileSchema>) => {
        setIsLoading(true);
        let successMessages = [];
        let retryWithFallback = false;

        try {
            // Handle profile updates in two separate steps for reliability:
            // 1. First update name if changed
            if (values.name !== profileData?.name) {
                console.log('Updating name to:', values.name);

                try {
                    await updateUserProfile({ name: values.name });

                    // Update local storage with new name
                    const currentName = localStorage.getItem('userName');
                    if (currentName && values.name !== currentName) {
                        localStorage.setItem('userName', values.name);
                    }

                    successMessages.push('Name updated successfully');
                } catch (nameError: any) {
                    console.error('Error updating name:', nameError);
                    toast({
                        title: 'Name update failed',
                        description: nameError.message || 'Failed to update your name',
                        variant: 'destructive',
                    });
                }
            }

            // 2. Then update profile image if changed
            const hasNewImage = profileImage !== profileData?.profileImage;
            if (hasNewImage && profileImage) {
                console.log('Updating profile image...');
                console.log(`Image size: ${Math.round(profileImage.length / 1024)}KB`);

                try {
                    // Use the dedicated profile image update function
                    await updateProfileImage(profileImage);

                    // Dispatch a profile updated event
                    window.dispatchEvent(new Event('profileUpdated'));

                    successMessages.push('Profile image updated successfully');
                } catch (imageError: any) {
                    console.error('Error updating profile image:', imageError);

                    // Check if it's the request entity too large error
                    const isTooLarge =
                        imageError.message?.includes('too large') ||
                        imageError.message?.includes('entity') ||
                        imageError.message?.includes('size');

                    if (isTooLarge) {
                        // Try our extreme fallback option - create a text-based avatar
                        retryWithFallback = true;

                        toast({
                            title: 'Trying alternative method',
                            description: 'Image is too large, using a simple letter avatar instead',
                        });
                    } else {
                        // Show regular error for other issues
                        toast({
                            title: 'Image update failed',
                            description: imageError.message || 'Failed to update profile image',
                            variant: 'destructive',
                        });
                    }
                }

                // If the standard method failed due to size limits, try fallback
                if (retryWithFallback) {
                    try {
                        console.log('Trying fallback letter avatar...');
                        // Create a tiny text avatar with first letter
                        const letter = values.name?.charAt(0) || 'U';
                        const tinyAvatar = createTinyAvatar(letter);

                        if (tinyAvatar) {
                            console.log(`Tiny letter avatar size: ${Math.round(tinyAvatar.length / 1024)}KB`);
                            await updateProfileImage(tinyAvatar);

                            // Update UI
                            window.dispatchEvent(new Event('profileUpdated'));
                            successMessages.push('Simple avatar created successfully');
                        }
                    } catch (fallbackError) {
                        console.error('Fallback avatar also failed:', fallbackError);
                        toast({
                            title: 'Image update failed',
                            description: 'Could not update profile image, even with fallback method',
                            variant: 'destructive',
                        });
                    }
                }
            }

            // Show success message if any of the updates succeeded
            if (successMessages.length > 0) {
                toast({
                    title: 'Account updated',
                    description: successMessages.join('. '),
                });
                onClose();
            } else if (!hasNewImage && values.name === profileData?.name) {
                toast({
                    title: 'No changes',
                    description: 'No changes were detected to save',
                });
                onClose();
            }
        } catch (error: any) {
            console.error('Unexpected error in profile update:', error);
            toast({
                title: 'Update failed',
                description: 'An unexpected error occurred. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Then modify the handleImageUpload function to use compression for large images
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);

        // File size validation (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast({
                title: 'File too large',
                description: 'Please select an image smaller than 10MB',
                variant: 'destructive',
            });
            setIsUploading(false);
            return;
        }

        try {
            const reader = new FileReader();
            reader.onload = async (event) => {
                if (event.target?.result) {
                    const originalImage = event.target.result as string;

                    // For debugging
                    console.log(`Original image size: ${Math.round(originalImage.length / 1024)}KB`);

                    try {
                        // Apply better balanced compression
                        const img = new Image();
                        img.src = originalImage;

                        await new Promise<void>((resolve) => {
                            img.onload = () => resolve();
                        });

                        // Create a medium-sized canvas - 300px max width/height for better quality
                        const canvas = document.createElement('canvas');
                        const MAX_DIM = 300;
                        const scale = Math.min(MAX_DIM / img.width, MAX_DIM / img.height);
                        canvas.width = Math.floor(img.width * scale);
                        canvas.height = Math.floor(img.height * scale);

                        const ctx = canvas.getContext('2d');
                        if (!ctx) throw new Error('Could not get canvas context');

                        // Draw image with high quality smoothing
                        ctx.imageSmoothingQuality = 'high';
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                        // Start with better quality (40%)
                        let compressedImage = canvas.toDataURL('image/jpeg', 0.4);
                        let imageSize = Math.round(compressedImage.length / 1024);
                        console.log(`Medium quality image (300px, 0.4 quality): ${imageSize}KB`);

                        // Only reduce quality if the image is too large
                        if (imageSize > 60) {
                            // Try with slightly lower quality (25%)
                            compressedImage = canvas.toDataURL('image/jpeg', 0.25);
                            imageSize = Math.round(compressedImage.length / 1024);
                            console.log(`Lower quality image (300px, 0.25 quality): ${imageSize}KB`);

                            // If still too large, reduce dimensions and quality more
                            if (imageSize > 40) {
                                // Reduce dimensions to 200px
                                canvas.width = 200;
                                canvas.height = 200 * (canvas.height / canvas.width);
                                ctx.imageSmoothingQuality = 'high';
                                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                                compressedImage = canvas.toDataURL('image/jpeg', 0.2);
                                imageSize = Math.round(compressedImage.length / 1024);
                                console.log(`Small image (200px, 0.2 quality): ${imageSize}KB`);
                            }
                        }

                        // Set the image in state
                        setProfileImage(compressedImage);
                        toast({
                            title: 'Image processed',
                            description: 'Image prepared for upload with balanced quality.',
                        });
                    } catch (compressionError) {
                        console.error('Error compressing image:', compressionError);
                        toast({
                            title: 'Image processing error',
                            description: 'Failed to process the image. Please try a different one.',
                            variant: 'destructive',
                        });
                    }
                }
                setIsUploading(false);
            };
            reader.onerror = () => {
                toast({
                    title: 'Error',
                    description: 'Failed to read image file',
                    variant: 'destructive',
                });
                setIsUploading(false);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Error processing image:', error);
            toast({
                title: 'Error',
                description: 'An unexpected error occurred while processing the image',
                variant: 'destructive',
            });
            setIsUploading(false);
        }
    };

    const removeProfileImage = () => {
        setProfileImage(null);
    };

    const getTierBadgeClass = (tier: string) => {
        switch (tier) {
            case 'pro':
                return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'lite':
                return 'bg-purple-50 text-purple-700 border-purple-200';
            default:
                return 'bg-blue-50 text-blue-700 border-blue-200';
        }
    };

    const getTierName = (tier: string) => {
        switch (tier) {
            case 'pro':
                return 'Pro';
            case 'lite':
                return 'Lite';
            default:
                return 'Free';
        }
    };

    // Format the createdAt date
    const formatJoinDate = (dateString: string) => {
        if (!dateString) return 'Unknown';
        try {
            const date = new Date(dateString);
            return format(date, 'MMMM d, yyyy');
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Unknown';
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] rounded-xl md:rounded-lg overflow-hidden">
                <DialogHeader>
                    <DialogTitle>Account Settings</DialogTitle>
                    <DialogDescription>
                        Update your account settings here
                    </DialogDescription>
                </DialogHeader>

                {isLoading && !profileData ? (
                    <div className="py-6 text-center">Loading account settings...</div>
                ) : (
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="space-y-6 py-4">
                            {/* Profile Image */}
                            <div className="flex flex-col items-center gap-4 py-2">
                                <div className="relative">
                                    <Avatar className="h-24 w-24 border-2 border-primary/20 rounded-full">
                                        {profileImage ? (
                                            <AvatarImage src={profileImage} alt="Profile" className="rounded-full" />
                                        ) : (
                                            <AvatarFallback className="bg-primary/10 text-primary text-xl rounded-full">
                                                {profileData?.name?.charAt(0).toUpperCase() || <User />}
                                            </AvatarFallback>
                                        )}
                                    </Avatar>

                                    <div className="absolute -bottom-2 -right-2 flex gap-1">
                                        <label
                                            htmlFor="profile-image-upload"
                                            className="bg-primary text-white p-1.5 rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
                                        >
                                            <Camera className="h-4 w-4" />
                                            <input
                                                id="profile-image-upload"
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleImageUpload}
                                                disabled={isUploading}
                                            />
                                        </label>

                                        {profileImage && (
                                            <button
                                                type="button"
                                                onClick={removeProfileImage}
                                                className="bg-destructive text-white p-1.5 rounded-full hover:bg-destructive/90 transition-colors"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {isUploading && <div className="text-sm text-muted-foreground">Uploading image...</div>}
                            </div>

                            {/* Account Information */}
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Display Name</Label>
                                    <Input
                                        id="name"
                                        {...form.register('name')}
                                        placeholder="Your name"
                                        className="mt-1"
                                    />
                                    {form.formState.errors.name && (
                                        <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>
                                    )}
                                </div>

                                <div>
                                    <Label>Email</Label>
                                    <Input
                                        value={profileData?.email}
                                        readOnly
                                        disabled
                                        className="mt-1 bg-muted/50"
                                    />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <Label>Subscription Tier</Label>
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                        <div className={`mt-1 inline-flex items-center gap-2 px-3 py-2 rounded-md border ${getTierBadgeClass(profileData?.tier || 'free')}`}>
                                            {getTierName(profileData?.tier || 'free')} Tier
                                        </div>
                                        {isSynchronizing ? (
                                            <Button variant="ghost" size="sm" disabled className="h-8 px-2 mt-1">
                                                <Zap className="h-3.5 w-3.5 animate-pulse mr-1" />
                                                Syncing...
                                            </Button>
                                        ) : (
                                            <Button variant="ghost" size="sm" onClick={synchronizeTierWithBackend} className="h-8 px-2 mt-1">
                                                <Zap className="h-3.5 w-3.5 mr-1" />
                                                Sync Tier
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <Label>Member Since</Label>
                                    <div className="mt-1 text-muted-foreground text-sm">
                                        {formatJoinDate(profileData?.createdAt || '')}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                            <DialogClose asChild>
                                <Button type="button" variant="outline" className="w-full sm:w-auto">Cancel</Button>
                            </DialogClose>
                            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                                {isLoading ? 'Saving...' : 'Save changes'}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default AccountSettings; 
