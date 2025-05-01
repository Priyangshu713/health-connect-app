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
import { getUserProfile, updateUserProfile, synchronizeTier } from '@/api/auth';
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

    const onSubmit = async (values: z.infer<typeof profileSchema>) => {
        setIsLoading(true);
        try {
            const updateData = {
                name: values.name,
                profileImage: profileImage || undefined
            };

            await updateUserProfile(updateData);

            // Update local storage with new name
            const currentName = localStorage.getItem('userName');
            if (currentName && values.name !== currentName) {
                localStorage.setItem('userName', values.name);
            }

            toast({
                title: 'Account updated',
                description: 'Your account settings have been updated successfully',
            });

            // Dispatch a profile updated event
            window.dispatchEvent(new Event('profileUpdated'));

            onClose();
        } catch (error) {
            console.error('Error updating profile:', error);
            toast({
                title: 'Update failed',
                description: 'Failed to update your account settings',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);

        // File size validation (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast({
                title: 'File too large',
                description: 'Please select an image smaller than 2MB',
                variant: 'destructive',
            });
            setIsUploading(false);
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                setProfileImage(event.target.result as string);
                setIsUploading(false);
            }
        };
        reader.readAsDataURL(file);
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
