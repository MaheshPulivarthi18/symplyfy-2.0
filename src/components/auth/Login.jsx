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
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import logo from "../../assets/logo_ai 2.svg";
import { LogIn } from 'lucide-react';
import { Link } from 'react-router-dom'; // Assuming you're using react-router for navigation

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
  keepSignedIn: z.boolean().default(false)
});

const Login = () => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      keepSignedIn: false,
    },
  });

  function onSubmit(values) {
    console.log(values);
    // send the data to backend
  }

  return (
    <div className="container mx-auto p-4 max-w-md">
      <Card className="shadow-lg">
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
                  <FormItem className="w-64">
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
                  <FormItem className="w-64">
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
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 w-64">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Keep me signed in</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              <p className="text-sm text-gray-600">
                <Link to="/forgotpassword" className="text-blue-600 hover:underline">Forgot Password? </Link>
              </p>
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