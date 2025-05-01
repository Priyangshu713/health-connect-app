import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import emailjs from '@emailjs/browser';

// Replace with your actual EmailJS service IDs
const SERVICE_ID = 'service_3y2vg5n';
const TEMPLATE_ID = 'template_bih3xv9';
const PUBLIC_KEY = 'up916aLQKcVp5vB6S';

// This constant will be the fixed recipient email
const ADMIN_EMAIL = 'priyangshu713@gmail.com';

const ContactPage = () => {
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        to_email: ADMIN_EMAIL,
        subject: '',
        message: ''
    });

    // Initialize EmailJS when component mounts
    useEffect(() => {
        emailjs.init(PUBLIC_KEY);
    }, []);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formRef.current) return;

        try {
            setIsSubmitting(true);

            // EmailJS template parameters - matching template variables exactly
            const templateParams = {
                name: formData.name,
                email: formData.email,
                title: formData.subject,  // If your template uses "title" instead of "subject"
                message: formData.message,
                reply_to: formData.email
            };

            console.log("Sending with template params:", templateParams);

            const result = await emailjs.send(
                SERVICE_ID,
                TEMPLATE_ID,
                templateParams,
                PUBLIC_KEY
            );

            console.log('Email successfully sent!', result.text);

            toast({
                title: "Message sent successfully!",
                description: "We'll get back to you as soon as possible.",
                variant: "default",
            });

            // Reset form
            setFormData({
                name: '',
                email: '',
                to_email: ADMIN_EMAIL,
                subject: '',
                message: ''
            });

        } catch (error: any) {
            console.error('Failed to send email:', error);

            // More detailed error message
            let errorMessage = "Please try again later or contact us directly via email.";
            if (error.text) {
                errorMessage = `Error: ${error.text}`;
            }

            toast({
                title: "Message failed to send",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="container mx-auto px-4 pt-24 pb-16">
                <motion.div
                    className="space-y-16 max-w-4xl mx-auto"
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                >
                    {/* Hero Section */}
                    <motion.section variants={itemVariants} className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">
                            Contact <span className="text-gradient">Us</span>
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Have questions about Health Connect? We're here to help you on your health journey.
                        </p>
                    </motion.section>

                    <motion.section variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Contact Information */}
                        <div className="space-y-8">
                            <h2 className="text-2xl font-semibold">Get in Touch</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We'd love to hear from you. Whether you have questions about our platform, need technical support, or want to provide feedback, our team is ready to assist.
                            </p>

                            <div className="space-y-6 mt-8">
                                <div className="flex items-start gap-4">
                                    <div className="bg-primary/10 p-2 rounded-full min-w-12 h-12 flex items-center justify-center mt-1">
                                        <Mail className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg mb-1">Email</h3>
                                        <p className="text-muted-foreground">support@healthconnect.com</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="bg-primary/10 p-2 rounded-full min-w-12 h-12 flex items-center justify-center mt-1">
                                        <Phone className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg mb-1">Phone</h3>
                                        <p className="text-muted-foreground">+1 (800) 123-4567</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="bg-primary/10 p-2 rounded-full min-w-12 h-12 flex items-center justify-center mt-1">
                                        <MapPin className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg mb-1">Location</h3>
                                        <p className="text-muted-foreground">123 Health Street, Wellness City, 10001</p>
                                    </div>
                                </div>
                            </div>

                            <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-none mt-8">
                                <CardContent className="p-6">
                                    <h3 className="font-semibold text-lg mb-3">Office Hours</h3>
                                    <div className="space-y-2 text-muted-foreground">
                                        <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                                        <p>Saturday: 10:00 AM - 4:00 PM</p>
                                        <p>Sunday: Closed</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Contact Form */}
                        <div className="space-y-8">
                            <h2 className="text-2xl font-semibold">Send a Message</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Fill out the form below and we'll get back to you as soon as possible.
                            </p>

                            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 mt-8">
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium mb-2">
                                            Name
                                        </label>
                                        <Input
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Your name"
                                            className="w-full"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium mb-2">
                                            Email
                                        </label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="Your email address"
                                            className="w-full"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="subject" className="block text-sm font-medium mb-2">
                                            Subject
                                        </label>
                                        <Input
                                            id="subject"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            placeholder="What is this regarding?"
                                            className="w-full"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="message" className="block text-sm font-medium mb-2">
                                            Message
                                        </label>
                                        <Textarea
                                            id="message"
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            placeholder="Your message"
                                            className="w-full min-h-[150px]"
                                            required
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full py-6 h-auto rounded-md text-base font-medium shadow-md hover:shadow-lg transition-all duration-300"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4 mr-2" />
                                            Send Message
                                        </>
                                    )}
                                </Button>
                            </form>
                        </div>
                    </motion.section>

                    <Separator className="bg-primary/10 my-16" />

                    {/* FAQ Section */}
                    <motion.section variants={itemVariants} className="my-16">
                        <h2 className="text-2xl font-semibold mb-8 text-center">Frequently Asked Questions</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="bg-card/50 backdrop-blur-sm border border-primary/10 hover:border-primary/20 transition-all duration-300">
                                <CardContent className="p-6">
                                    <h3 className="font-semibold text-lg mb-3">How secure is my health data?</h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        Your health data is encrypted and stored securely. We follow industry best practices for data protection and comply with all relevant privacy regulations.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="bg-card/50 backdrop-blur-sm border border-primary/10 hover:border-primary/20 transition-all duration-300">
                                <CardContent className="p-6">
                                    <h3 className="font-semibold text-lg mb-3">Can I integrate with my wearable devices?</h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        Yes, Health Connect supports integration with popular wearable devices and health apps to provide a comprehensive view of your health.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="bg-card/50 backdrop-blur-sm border border-primary/10 hover:border-primary/20 transition-all duration-300">
                                <CardContent className="p-6">
                                    <h3 className="font-semibold text-lg mb-3">How accurate are the AI recommendations?</h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        Our AI recommendations are based on established health guidelines and your personal data. They're designed to be helpful guides, not medical diagnoses.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="bg-card/50 backdrop-blur-sm border border-primary/10 hover:border-primary/20 transition-all duration-300">
                                <CardContent className="p-6">
                                    <h3 className="font-semibold text-lg mb-3">Is there a mobile app available?</h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        Currently, Health Connect is optimized for web browsers on both desktop and mobile devices. A dedicated mobile app is in development.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </motion.section>
                </motion.div>
            </main>
        </div>
    );
};

export default ContactPage; 