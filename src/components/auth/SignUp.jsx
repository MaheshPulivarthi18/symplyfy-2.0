import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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

const formSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters.").max(50),
  lastName: z.string().min(2, "Last name must be at least 2 characters.").max(50),
  dateOfBirth: z.string().refine((date) => {
    return new Date(date) < new Date() && new Date(date) > new Date('1900-01-01');
  }, "Please enter a valid date of birth."),
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

const SignUp = () => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "",
      experience: "",
      role: "",
      email: "",
      mobileNumber: "",
      password: "",
      reEnterPassword: "",
    },
  });

  function onSubmit(values) {
    console.log(values);
    // send the data to backend
  }

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <Card className="shadow-lg">
        <CardHeader className=' items-center gap-4'>
            <img src={logo} className='w-24'></img>
          <CardTitle className="text-2xl font-semibold items-center">
            Sign up
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className='flex gap-8'>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Personal details</h3>
                        <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                            <FormItem className="w-64">
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
                            <FormItem className="w-64">
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
                            name="dateOfBirth"
                            render={({ field }) => (
                            <FormItem className="w-64">
                                <FormLabel>Date of birth</FormLabel>
                                <FormControl>
                                <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="gender"
                            render={({ field }) => (
                            <FormItem className="w-64">
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
                            <FormItem className="w-64">
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
                            <FormItem className="w-64">
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
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Account details</h3>
                        <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem className="w-64">
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
                            <FormItem className="w-64">
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
                            <FormItem className="w-64">
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
                            <FormItem className="w-64">
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
                <Button type="submit" className="w-full">Create Account</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUp;