import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Clock, Sparkles, ZapIcon, CheckCircle, Info, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';

// Define the structure of a changelog entry
interface ChangelogItem {
    date: string;
    version: string;
    items: {
        text: string;
        type?: 'feature' | 'improvement' | 'bugfix' | 'announcement';
        link?: {
            text: string;
            url: string;
        };
    }[];
}

// Sample changelog data - this would come from your backend in a real app
const changelogData: ChangelogItem[] = [
    {
        date: 'May 20, 2023',
        version: '2.5.0',
        items: [
            {
                text: 'Added Nutrition & Fitness Tracker with integrated meal and workout tracking',
                type: 'feature'
            },
            {
                text: 'Improved UI animations for a smoother user experience',
                type: 'improvement'
            },
            {
                text: 'New AI-powered recipe suggestions based on your health profile',
                type: 'feature'
            }
        ]
    },
    {
        date: 'April 15, 2023',
        version: '2.4.2',
        items: [
            {
                text: 'Fixed loading issues with health reports on mobile devices',
                type: 'bugfix'
            },
            {
                text: 'Added more detailed nutrition information for common foods',
                type: 'improvement'
            },
            {
                text: 'Announcement: Health specialists directory now available nationwide',
                type: 'announcement'
            }
        ]
    },
    {
        date: 'March 29, 2023',
        version: '2.4.0',
        items: [
            {
                text: 'Launched new AI chatbot for personalized health questions',
                type: 'feature'
            },
            {
                text: 'Redesigned profile page with better health metrics visualization',
                type: 'improvement'
            },
            {
                text: 'Added support for importing health data from wearable devices',
                type: 'feature'
            }
        ]
    }
];

interface ChangelogDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

const ChangelogDialog: React.FC<ChangelogDialogProps> = ({ isOpen, onClose }) => {
    // State to track which sections are expanded (by default, all are expanded)
    const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>(() => {
        // Initialize with first section expanded, others collapsed
        const initialState: Record<number, boolean> = {};
        changelogData.forEach((_, index) => {
            initialState[index] = index === 0; // Only first section is expanded by default
        });
        return initialState;
    });

    // Toggle section expanded state
    const toggleSection = (index: number) => {
        setExpandedSections(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    // Function to get the appropriate icon for each type of update
    const getItemIcon = (type?: string) => {
        switch (type) {
            case 'feature':
                return <Sparkles className="h-4 w-4 text-primary" />;
            case 'improvement':
                return <ZapIcon className="h-4 w-4 text-indigo-500" />;
            case 'bugfix':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'announcement':
                return <Info className="h-4 w-4 text-amber-500" />;
            default:
                return <Sparkles className="h-4 w-4 text-primary" />;
        }
    };

    // Function to get the badge text for update type
    const getBadgeText = (type?: string) => {
        switch (type) {
            case 'feature':
                return <Badge variant="default" className="bg-primary hover:bg-primary">New Feature</Badge>;
            case 'improvement':
                return <Badge variant="outline" className="text-indigo-500 border-indigo-500">Improvement</Badge>;
            case 'bugfix':
                return <Badge variant="outline" className="text-green-500 border-green-500">Bug Fix</Badge>;
            case 'announcement':
                return <Badge variant="outline" className="text-amber-500 border-amber-500">Announcement</Badge>;
            default:
                return <Badge variant="secondary">Update</Badge>;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <DialogTitle className="text-xl">What's New in HealthConnect</DialogTitle>
                    </div>
                    <DialogDescription>
                        See the latest updates, improvements, and features we've added to make your health journey better.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {changelogData.map((release, idx) => (
                        <div key={idx} className="overflow-hidden">
                            <div
                                className="flex items-center gap-2 cursor-pointer"
                                onClick={() => toggleSection(idx)}
                            >
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <h3 className="text-lg font-medium">{release.date}</h3>
                                <Badge variant="secondary" className="ml-2">v{release.version}</Badge>
                                <div className="ml-auto">
                                    <motion.div
                                        animate={{ rotate: expandedSections[idx] ? 180 : 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                    </motion.div>
                                </div>
                            </div>

                            <AnimatePresence>
                                {expandedSections[idx] && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="space-y-3 ml-6 mt-4 mb-2">
                                            {release.items.map((item, itemIdx) => (
                                                <div key={itemIdx} className="flex items-start gap-3">
                                                    {getItemIcon(item.type)}
                                                    <div className="space-y-1">
                                                        <span className="text-sm">{item.text}</span>
                                                        <div className="flex mt-1">
                                                            {getBadgeText(item.type)}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {idx < changelogData.length - 1 && (
                                <Separator className="my-4" />
                            )}
                        </div>
                    ))}
                </div>

                <DialogFooter className="pt-2">
                    <Button onClick={onClose} className="w-full sm:w-auto">Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ChangelogDialog; 