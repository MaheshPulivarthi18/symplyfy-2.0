// PatientList.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Import the patients array (in a real app, this would be fetched from an API)
import { patients } from './profile/NewPatient';

const PatientList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState(patients);
  const navigate = useNavigate();

  useEffect(() => {
    setFilteredPatients(
      patients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, patients]);

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);


  return (
    <Card className={`w-full mx-auto mt-8 container p-4 shadow-xl transition-all duration-500 ease-out ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Patient Management</CardTitle>
        <div className="flex justify-between items-center mt-4">
          <Input
            type="text"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Button onClick={() => navigate('/patient/new')}>Add New Patient</Button>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {filteredPatients.map(patient => (
            <li key={patient.id} className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${patient.name}`} />
                  <AvatarFallback>{patient.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{patient.name}</h3>
                  <p className="text-sm text-gray-500">{patient.email}</p>
                </div>
              </div>
              <Link to={`/patient/profile/${patient.id}`}>
                <Button variant="outline">View Profile</Button>
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default PatientList;