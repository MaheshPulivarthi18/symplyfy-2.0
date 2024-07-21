// PatientProfile.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { patients } from './NewPatient';

const visits = [
  { id: 1, patientId: 1, date: '2023-07-15', type: 'Checkup', status: 'Completed' },
  { id: 2, patientId: 1, date: '2023-08-20', type: 'Follow-up', status: 'Scheduled' },
  // Add more visits as needed
];

const PatientProfile = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const patient = patients.find(p => p.id === parseInt(id));

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: patient.name,
    email: patient.email,
    age: patient.age,
    gender: patient.gender,
  });

  if (!patient) return <div>Patient not found</div>;

  const pastVisits = visits.filter(v => v.patientId === patient.id && new Date(v.date) < new Date());
  const upcomingVisits = visits.filter(v => v.patientId === patient.id && new Date(v.date) >= new Date());

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Here you would typically send the updated data to your backend
      // For this example, we'll just update the local state
      const updatedPatient = { ...patient, ...formData };
      console.log('Updated patient data:', updatedPatient);

      setIsEditing(false);
      toast({ title: "Success", description: "Patient information updated successfully" });
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);


  return (
    <div className={`flex w-full gap-8 p-8 container mx-auto shadow-xl transition-all duration-500 ease-out ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
      <Card className="w-[45%]">
        <CardHeader>
          <CardTitle>Patient Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${formData.name}`} />
                <AvatarFallback>{formData.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div className="w-full space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
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
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    value={formData.age}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    name="gender"
                    value={formData.gender}
                    onValueChange={(value) => setFormData({ ...formData, gender: value })}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className='w-full flex justify-between'>
                {isEditing ? (
                  <div className="space-x-2">
                    <Button type="submit">Save Changes</Button>
                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                  </div>
                ) : (
                  <Button type="button" onClick={() => setIsEditing(true)}>Edit Patient</Button>
                )}
                <Link to={`/patient/profile/${id}/schedule`}>
                  <Button variant="outline">View Schedule</Button>
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="w-2/3 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Past Visits</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {pastVisits.map(visit => (
                <li key={visit.id} className="p-2 bg-gray-100 rounded">
                  {visit.date} - {visit.type}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Visits</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {upcomingVisits.map(visit => (
                <li key={visit.id} className="p-2 bg-gray-100 rounded">
                  {visit.date} - {visit.type}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PatientProfile;