// signup.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import logo from "../../assets/logo_ai 2.svg"

const signupSchema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters.").max(50),
  lastName: z.string().min(2, "Last name must be at least 2 characters.").max(50),
  gender: z.string().min(1, "Please select a gender."),
  experience: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) >= 0, {
    message: "Experience must be a non-negative number."
  }),
  role: z.string().min(1, "Please select a role."),
  email: z.string().email("Please enter a valid email address."),
  mobileNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Please enter a valid mobile number."),
  password: z.string().min(8, "Password must be at least 8 characters.")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."),
  reEnterPassword: z.string(),
}).refine((data) => data.password === data.reEnterPassword, {
  message: "Passwords don't match",
  path: ["reEnterPassword"],
});

const verificationSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  verificationCode: z.string().min(1, "Verification code is required"),
});

const SignUp = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const form = useForm({
    resolver: zodResolver(isVerifying ? verificationSchema : signupSchema),
    defaultValues: {
      first_name: "",
      lastName: "",
      gender: "",
      experience: "",
      role: "",
      email: "",
      mobileNumber: "",
      password: "",
      reEnterPassword: "",
      verificationCode: "",
    },
  });
  const { preRegister, verifyEmail, register } = useAuth();
  const { toast } = useToast()
  const navigate = useNavigate();
  const [oldValues, setOldValues] = useState(null)

  const onSubmit = async (values) => {
    console.log("Form submitted", values);
    try {
      if (!isVerifying) {
        // Step 1: Pre-registration
        await preRegister(values.email);
        setIsVerifying(true);
        setOldValues(values)
        toast({
          title: "Verification Code Sent",
          description: "Please check your email for the verification code.",
        });
        // Reset form validation schema
        form.clearErrors();
      } else {
        // Step 2: Email verification and Step 3: Final registration
        const verificationCode = values.verificationCode;
        
        if (!verificationCode) {
          toast({
            title: "Error",
            description: "Please enter the verification code sent to your email.",
            variant: "destructive",
          });
          return;
        }
        
        // await verifyEmail(values.email, verificationCode);
        await register(oldValues, verificationCode);
        
        toast({
          title: "Success",
          description: "You have successfully registered.",
        });
        navigate('/login');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Registration failed. Please try again.",
        variant: "destructive",
      });
    }
  };


  const onError = (errors) => {
    console.log("Form errors", errors); // Add this line
    toast({
      title: "Error",
      description: "Please correct the errors in the form.",
      variant: "destructive",
    });
  };

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <Card className={`shadow-lg w-full transition-all duration-500 ease-out ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <CardHeader className=' items-center gap-4'>
            <img src={logo} className='w-24'></img>
          <CardTitle className="text-2xl font-semibold items-center">
            Sign up
          </CardTitle>
        </CardHeader>
        <CardContent className='w-full'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
                <div className='flex gap-8 w-full'>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-2/3">
                        <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Personal details</h3>
                        <FormField
                            control={form.control}
                            name="first_name"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>First name</FormLabel>
                                <FormControl>
                                <Input placeholder="First name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Last name</FormLabel>
                                <FormControl>
                                <Input placeholder="Last name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="gender"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Gender</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                    <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        </div>
                        <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Professional details</h3>
                        <FormField
                            control={form.control}
                            name="experience"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Experience (in years)</FormLabel>
                                <FormControl>
                                <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Role in organization</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="therapist">Therapist</SelectItem>
                                    <SelectItem value="doctor">Doctor</SelectItem>
                                    <SelectItem value="receptionist">Receptionist</SelectItem>
                                </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        </div>
                    </div>
                    <div className="space-y-4 w-1/3">
                        <h3 className="text-lg font-semibold">Account details</h3>
                        <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input type="email" placeholder="Email" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="mobileNumber"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Mobile number</FormLabel>
                            <FormControl>
                                <Input type="tel" placeholder="Mobile number" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="Password" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="reEnterPassword"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Re-enter password</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="Re-enter password" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </div>
                </div>
                {isVerifying && (
                  <FormField
                    control={form.control}
                    name="verificationCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Verification Code</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter verification code" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Submitting...' : isVerifying ? 'Complete Registration' : 'Sign Up'}
                </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUp;