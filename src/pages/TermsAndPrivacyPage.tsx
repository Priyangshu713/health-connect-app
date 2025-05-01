import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Lock, Shield, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const TermsAndPrivacyPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState<string>('terms');

    useEffect(() => {
        // Check URL query parameter for tab selection
        const searchParams = new URLSearchParams(location.search);
        const tabParam = searchParams.get('tab');
        if (tabParam === 'privacy') {
            setActiveTab('privacy');
        }
    }, [location]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <motion.div
            className="min-h-[calc(100vh-120px)] flex flex-col pt-24 px-4 md:px-8 lg:px-16 max-w-7xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <motion.div variants={itemVariants} className="flex items-center mb-6">
                <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft className="h-4 w-4" /> Back
                </Button>
            </motion.div>

            <motion.div variants={itemVariants} className="mb-8 text-center">
                <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center justify-center gap-2">
                    <Heart className="text-primary h-6 w-6" />
                    Legal Terms & Privacy
                </h1>
                <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white/95 backdrop-blur-sm rounded-lg border shadow-md p-6 mb-12">
                <Tabs defaultValue="terms" value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid grid-cols-2 mb-6">
                        <TabsTrigger value="terms" className="text-lg">Terms of Service</TabsTrigger>
                        <TabsTrigger value="privacy" className="text-lg">Privacy Policy</TabsTrigger>
                    </TabsList>

                    <TabsContent value="terms" className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                                <Shield className="h-5 w-5 text-primary" />
                                Terms of Service
                            </h2>

                            <div className="space-y-4 text-muted-foreground">
                                <section>
                                    <h3 className="font-medium text-foreground mb-2">1. Acceptance of Terms</h3>
                                    <p>By accessing or using HealthConnect, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.</p>
                                </section>

                                <section>
                                    <h3 className="font-medium text-foreground mb-2">2. Service Description</h3>
                                    <p>HealthConnect provides a platform for users to track and manage personal health information. Our service offers tools to monitor health metrics, set goals, and receive personalized insights.</p>
                                </section>

                                <section>
                                    <h3 className="font-medium text-foreground mb-2">3. User Accounts</h3>
                                    <p>To use HealthConnect, you must create an account with a valid email address and password. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.</p>
                                </section>

                                <section>
                                    <h3 className="font-medium text-foreground mb-2">4. Local Data Storage</h3>
                                    <p>HealthConnect is designed to store your health data locally on your device. We do not store your health information on our servers. You are responsible for backing up your data.</p>
                                </section>

                                <section>
                                    <h3 className="font-medium text-foreground mb-2">5. User Conduct</h3>
                                    <p>You agree not to use HealthConnect for any unlawful purpose or in any way that could damage, disable, or impair the service. You may not attempt to gain unauthorized access to any part of the service.</p>
                                </section>

                                <section>
                                    <h3 className="font-medium text-foreground mb-2">6. Intellectual Property</h3>
                                    <p>All content, features, and functionality of HealthConnect are owned by us and are protected by international copyright, trademark, and other intellectual property laws.</p>
                                </section>

                                <section>
                                    <h3 className="font-medium text-foreground mb-2">7. Disclaimer of Warranties</h3>
                                    <p>HealthConnect is provided "as is" without warranties of any kind. We do not guarantee that the service will be error-free or uninterrupted.</p>
                                </section>

                                <section>
                                    <h3 className="font-medium text-foreground mb-2">8. Limitation of Liability</h3>
                                    <p>HealthConnect shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.</p>
                                </section>

                                <section>
                                    <h3 className="font-medium text-foreground mb-2">9. Modifications to Terms</h3>
                                    <p>We reserve the right to modify these Terms of Service at any time. Continued use of HealthConnect after changes constitutes acceptance of the modified terms.</p>
                                </section>

                                <section>
                                    <h3 className="font-medium text-foreground mb-2">10. Governing Law</h3>
                                    <p>These Terms of Service shall be governed by the laws of the jurisdiction in which we operate, without regard to its conflict of law provisions.</p>
                                </section>
                            </div>
                        </motion.div>
                    </TabsContent>

                    <TabsContent value="privacy" className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                                <Lock className="h-5 w-5 text-primary" />
                                Privacy Policy
                            </h2>

                            <div className="space-y-4 text-muted-foreground">
                                <section>
                                    <h3 className="font-medium text-foreground mb-2">1. Data Collection</h3>
                                    <p>HealthConnect is committed to protecting your privacy. We only collect and store your login information (email and password) on our servers. <strong>All health data, history, and personal metrics are stored exclusively on your local device.</strong></p>
                                </section>

                                <section>
                                    <h3 className="font-medium text-foreground mb-2">2. Information We Collect</h3>
                                    <p>We collect only the following information:</p>
                                    <ul className="list-disc pl-5 space-y-1 mt-2">
                                        <li>Your name</li>
                                        <li>Email address</li>
                                        <li>Password (encrypted)</li>
                                        <li>Basic account activity data (login dates, app usage statistics)</li>
                                    </ul>
                                </section>

                                <section>
                                    <h3 className="font-medium text-foreground mb-2">3. Local Data Storage</h3>
                                    <p>Your health data, including but not limited to:</p>
                                    <ul className="list-disc pl-5 space-y-1 mt-2">
                                        <li>Health metrics and measurements</li>
                                        <li>Personal health history</li>
                                        <li>Medical records</li>
                                        <li>Nutrition information</li>
                                        <li>Fitness data</li>
                                        <li>Goals and progress</li>
                                    </ul>
                                    <p className="mt-2"><strong>These data points are stored exclusively on your device and are not transmitted to or stored on our servers.</strong></p>
                                </section>

                                <section>
                                    <h3 className="font-medium text-foreground mb-2">4. How We Use Your Information</h3>
                                    <p>We use your login information solely for the purpose of:</p>
                                    <ul className="list-disc pl-5 space-y-1 mt-2">
                                        <li>Account authentication and security</li>
                                        <li>Providing account-related notifications</li>
                                        <li>Improving our services</li>
                                    </ul>
                                </section>

                                <section>
                                    <h3 className="font-medium text-foreground mb-2">5. Data Security</h3>
                                    <p>We implement robust security measures to protect your login information. Your password is encrypted, and we use industry-standard protocols to safeguard your data.</p>
                                </section>

                                <section>
                                    <h3 className="font-medium text-foreground mb-2">6. Data Sharing</h3>
                                    <p>We do not sell, trade, or otherwise transfer your personal information to third parties. Your login information is only used for providing our service to you.</p>
                                </section>

                                <section>
                                    <h3 className="font-medium text-foreground mb-2">7. Your Control</h3>
                                    <p>You can:</p>
                                    <ul className="list-disc pl-5 space-y-1 mt-2">
                                        <li>Access and update your account information at any time</li>
                                        <li>Delete your account and associated login information from our servers</li>
                                        <li>Manage all your health data locally on your device</li>
                                        <li>Export or delete your local health data at your discretion</li>
                                    </ul>
                                </section>

                                <section>
                                    <h3 className="font-medium text-foreground mb-2">8. Updates to Privacy Policy</h3>
                                    <p>We may update this Privacy Policy periodically. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.</p>
                                </section>

                                <section>
                                    <h3 className="font-medium text-foreground mb-2">9. Contact Us</h3>
                                    <p>If you have any questions about this Privacy Policy, please contact us at privacy@healthconnect.com.</p>
                                </section>
                            </div>
                        </motion.div>
                    </TabsContent>
                </Tabs>
            </motion.div>

            <motion.div variants={itemVariants} className="text-center mb-8">
                <Button
                    onClick={() => navigate(-1)}
                    className="bg-gradient-to-r from-primary to-health-lavender hover:opacity-90"
                >
                    I Understand and Accept
                </Button>
            </motion.div>
        </motion.div>
    );
};

export default TermsAndPrivacyPage; 