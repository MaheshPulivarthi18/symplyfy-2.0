import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axios from 'axios';

// Schema validation with Zod
const clinicInformationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  display_name: z.string().min(1, "Display name is required"),
  address_line_1: z.string().min(1, "Address line 1 is required"),
  address_line_2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  pincode: z.string().regex(/^\d+$/, "Invalid pincode"),
  phone1: z.string().regex(/^\d+$/, "Invalid phone number"),
  email1: z.string().email("Invalid email address"),
  type: z.enum(["ph", "other"]), // Clinic types
  prefix_invoice: z.string().min(1, "Invoice prefix is required"),
  prefix_patient_id: z.string().optional(),
});

const ClinicInformation = () => {
  const { clinic_id } = useParams();
  const { toast } = useToast();
  const { authenticatedFetch } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [presentImg, setPresentImg] = useState(null);
  const [isPrefixPatientEditable, setIsPrefixPatientEditable] = useState(false); // For showing button/input

  const form = useForm({
    resolver: zodResolver(clinicInformationSchema),
    defaultValues: {
      name: '',
      display_name: '',
      address_line_1: '',
      address_line_2: null,
      city: '',
      pincode: '',
      phone1: '',
      email1: '',
      type: 'ph',
      prefix_invoice: '',
      prefix_patient_id: null, // Initialize as null
    },
  });

  useEffect(() => {
    fetchClinicData();
  }, []);

  const fetchClinicData = async () => {
    setIsLoading(true);
    try {
      const response = await authenticatedFetch(`${import.meta.env.VITE_BASE_URL}/api/emp/clinic/${clinic_id}/`);
      if (!response.ok) throw new Error('Failed to fetch clinic data');
      const data = await response.json();
      setPresentImg(data.logo_long);
      form.reset({
        name: data.name ?? '',
        display_name: data.display_name ?? '',
        address_line_1: data.address_line_1 ?? '',
        address_line_2: data.address_line_2 ?? '',
        city: data.city ?? '',
        pincode: data.pincode ?? '',
        phone1: data.phone1 ?? '',
        email1: data.email1 ?? '',
        type: data.type ?? 'ph',
        prefix_invoice: data.prefix_invoice ?? '',
        prefix_patient_id: data.prefix_patient_id ?? null,
      });

      // Check if prefix_patient_id is null to manage the button state
      if (!data.prefix_patient_id) {
        setIsPrefixPatientEditable(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch clinic information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (values) => {
    const submitData = {
      ...values,
      address_line_2: values.address_line_2 ? values.address_line_2 : null,
    };
    try {
      const response = await authenticatedFetch(`${import.meta.env.VITE_BASE_URL}/api/emp/clinic/${clinic_id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) throw new Error('Failed to update clinic information');

      toast({
        title: "Success",
        description: "Clinic information updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update clinic information. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditPrefixPatientId = () => {
    setIsPrefixPatientEditable(true);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="w-full max-w-4xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Clinic Information</CardTitle>
      </CardHeader>
      <CardContent>
        <p className='font-semibold'>Invoice Logo</p>
        <div className='flex justify-center'>
          {presentImg ? (
            <img src={presentImg} alt="Invoice Logo" className="max-w-full max-h-[80vh] object-contain" />
          ) : (
            <>No logo uploaded yet</>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
           <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Clinic Name</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="display_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address_line_1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Line 1</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address_line_2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Line 2</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pincode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pincode</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Clinic Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? 'ph'}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue value="ph" placeholder="Select clinic type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ph">PH</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="prefix_invoice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invoice Prefix</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
  control={form.control}
  name="prefix_patient_id"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Prefix Patient ID</FormLabel>
      {!isPrefixPatientEditable && field.value ? (
        <FormControl>
          <Input {...field} value={field.value ?? ''} readOnly placeholder="Prefix Patient ID set and cannot be changed" />
        </FormControl>
      ) : (
        <>
          {isPrefixPatientEditable ? (
            <FormControl>
              <Input {...field} value={field.value ?? ''} placeholder="Enter Prefix Patient ID" />
            </FormControl>
          ) : (
            <Button type="button" onClick={handleEditPrefixPatientId}>
              Add Prefix Patient ID
            </Button>
          )}
        </>
      )}
    </FormItem>
  )}
/>
            <Button type="submit" className="mt-6">Update Clinic Information</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ClinicInformation;
