import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Lock, Mail, User } from "lucide-react";
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate, Link } from 'react-router-dom';
import { dispatchAuthEvent } from '@/App';
import { registerUser } from '@/api/auth';
import { useHealthStore } from '@/store/healthStore';

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

const SignupForm = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setGeminiTier } = useHealthStore();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);

    try {
      // Submit only name, email, and password to the API
      const { name, email, password } = data;
      const registerData = { name, email, password };

      const result = await registerUser(registerData);

      // Store auth info in localStorage
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userName', name);
      localStorage.setItem('token', result.token);

      // Store tier information (defaults to 'free' for new users)
      if (result.tier) {
        localStorage.setItem('geminiTier', result.tier);
        setGeminiTier(result.tier);
      } else {
        localStorage.setItem('geminiTier', 'free');
        setGeminiTier('free');
      }

      // Dispatch auth event to update global state
      dispatchAuthEvent(true, email);

      // Show success toast
      toast({
        title: "Account created successfully",
        description: "Welcome to HealthConnect!",
      });

      // Navigate to profile page
      navigate('/profile', { state: { justLoggedIn: true } });
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Your name"
                      className="pl-10"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="you@example.com"
                      className="pl-10"
                      type="email"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="••••••••"
                      className="pl-10"
                      type="password"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="••••••••"
                      className="pl-10"
                      type="password"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="pt-2"
        >
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-health-mint to-primary hover:opacity-90"
            disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-xs text-center text-muted-foreground mt-2"
        >
          By signing up, you agree to our <Link to="/terms-privacy" className="text-primary hover:underline">Terms of Service</Link> and <Link to="/terms-privacy?tab=privacy" className="text-primary hover:underline">Privacy Policy</Link>
        </motion.p>
      </form>
    </Form>
  );
};

export default SignupForm;
