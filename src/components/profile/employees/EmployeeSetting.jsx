// EmployeeSettings.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const initialDoctors = [
  { id: 1, firstName: 'Dr. Brown', lastName: 'Smith', email: 'brown.smith@example.com' },
  { id: 2, firstName: 'Dr. White', lastName: 'Johnson', email: 'white.johnson@example.com' },
  { id: 3, firstName: 'Dr. Green', lastName: 'Williams', email: 'green.williams@example.com' },
  { id: 4, firstName: 'Dr. Yellow', lastName: 'Jones', email: 'yellow.jones@example.com' },
  { id: 5, firstName: 'Dr. Red', lastName: 'Davis', email: 'red.davis@example.com' },
  { id: 6, firstName: 'Dr. Orange', lastName: 'Miller', email: 'orange.miller@example.com' },
];

const EmployeeSettings = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [doctors, setDoctors] = useState(initialDoctors);
  const doctor = doctors.find(doc => doc.id === parseInt(id));
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: doctor.firstName,
    lastName: doctor.lastName,
    email: doctor.email,
    mobile: 'None',
  });

  if (!doctor) {
    return <div>Employee not found</div>;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // In a real application, you would make an API call here
      // For this example, we'll just update the local state
      const updatedDoctors = doctors.map(doc => 
        doc.id === doctor.id ? { ...doc, ...formData } : doc
      );
      setDoctors(updatedDoctors);

      setIsEditing(false);
      toast({ title: "Success", description: "Employee data updated successfully" });
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);


  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card className={`container mx-auto p-4 w-full shadow-xl transition-all duration-500 ease-out ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Employee Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${formData.firstName} ${formData.lastName}`} alt={formData.firstName} />
              <AvatarFallback>{formData.firstName[0]}{formData.lastName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{formData.firstName} {formData.lastName}</h2>
              <p className="text-gray-500">{formData.email}</p>
            </div>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="mobile">Mobile</Label>
                <Input
                  id="mobile"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
            </div>
            {isEditing ? (
              <div className="mt-6 space-x-2">
                <Button type="submit">Save Changes</Button>
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              </div>
            ) : (
              <Button type="button" onClick={() => setIsEditing(true)} className="mt-6">Edit Employee</Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeSettings;