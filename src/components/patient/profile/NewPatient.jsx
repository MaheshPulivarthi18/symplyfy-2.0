// NewPatient.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

// This would typically be in a separate file or managed by a state management library
let patients = [
  { id: 1, name: 'John Doe', email: 'john@example.com', age: 35, gender: 'Male' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 28, gender: 'Female' },
  { id: 3, name: 'Alice Johnson', email: 'alice@example.com', age: 42, gender: 'Female' },
];

const NewPatient = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    gender: '',
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Generate a new ID (in a real app, this would be done by the backend)
    const newId = patients.length > 0 ? Math.max(...patients.map(p => p.id)) + 1 : 1;
    
    // Create a new patient object
    const newPatient = {
      id: newId,
      ...formData,
      age: parseInt(formData.age, 10) // Ensure age is a number
    };

    // Add the new patient to our "database"
    patients = [...patients, newPatient];

    // Show a success toast
    toast({
      title: "Success",
      description: `New patient ${newPatient.name} has been added.`,
    });

    // Navigate back to the patient list
    navigate('/patients');
  };

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Add New Patient</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="age">Age</Label>
            <Input id="age" name="age" type="number" value={formData.age} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="gender">Gender</Label>
            <Select name="gender" value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit">Add Patient</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default NewPatient
export {patients}