import React, { useState, useEffect } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import logo from "../../assets/logo_ai 2.svg";
import { LogIn } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
  keepSignedIn: z.boolean().default(false)
});

const Login = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      keepSignedIn: false,
    },
  });

  const navigate = useNavigate()

  function onSubmit(values) {
    navigate('/dashboard')
    console.log(values);
    // Here you would typically send the data to your backend
  }

  return (
    <div className="container mx-auto p-4 max-w-md">
      <Card className={`shadow-lg transition-all duration-500 ease-out ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <CardHeader className='items-center gap-4'>
          <img src={logo} className='w-24' alt="Logo" />
          <CardTitle className="text-2xl font-semibold">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField

                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input type="email" placeholder="Email" {...field} />
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
                    <FormControl>
                      <Input type="password" placeholder="Password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="keepSignedIn"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="w-full leading-none flex justify-between">
                      <FormLabel>Keep me signed in</FormLabel>
                        <p className="text-sm text-gray-600 ">
                            <Link to="/forgotpassword" className="text-blue-600 hover:underline">Forgot Password? </Link>
                        </p>
                    </div>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                <LogIn className='w-[1rem] mt-[0.5px] mr-2' />
                Login
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            New user? <Link to="/signup" className="text-blue-600 hover:underline">Sign up here</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;