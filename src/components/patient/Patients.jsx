// PatientList.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress'

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { clinic_id } = useParams();
  const { authenticatedFetch } = useAuth();
  const { toast } = useToast();
  const [progress, setProgress] = useState(13);

  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setProgress((oldProgress) => {
          if (oldProgress === 100) {
            clearInterval(interval);
            return 100;
          }
          const newProgress = oldProgress + Math.random() * 10;
          return Math.min(newProgress, 90);
        });
      }, 10);
    }
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    fetchPatients();
  }, [clinic_id]);

  useEffect(() => {
    setFilteredPatients(
      patients.filter(patient =>
        `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, patients]);

  const fetchPatients = async () => {
    try {
      const response = await authenticatedFetch(`${import.meta.env.VITE_BASE_URL}/api/emp/clinic/${clinic_id}/patient/`);
      if (!response.ok) throw new Error('Failed to fetch patients');
      const data = await response.json();
      setPatients(data);
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch patients. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full flex flex-col items-center justify-center">
        <Progress value={progress} className="w-[60%]" />
        <p className="mt-4 text-sm text-gray-500">Loading employees... {Math.round(progress)}%</p>
      </div>
    );
  }

  return (
    <Card className="w-full mx-auto mt-8 container p-4 shadow-xl">
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
          <Button onClick={() => navigate(`/clinic/${clinic_id}/patients/new`)}>Add New Patient</Button>
        </div>
      </CardHeader>
      <CardContent>
        {patients.length === 0 ? (
          <div className="text-center py-4">
            <p className="mb-4">No patients found in this clinic.</p>
            <Button onClick={() => navigate(`/clinic/${clinic_id}/patients/new`)}>Add Your First Patient</Button>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="text-center py-4">
            <p>No patients match your search.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Primary Therapist</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map(patient => (
                <tr key={patient.id} className="border-t">
                  <td className="py-2">
                    <div className="flex items-center">
                      <Avatar className="mr-2">
                        <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${patient.first_name} ${patient.last_name}`} />
                        <AvatarFallback>{patient.first_name[0]}{patient.last_name[0]}</AvatarFallback>
                      </Avatar>
                      {patient.first_name} {patient.last_name}
                    </div>
                  </td>
                  <td>{patient.email}</td>
                  <td>{patient.mobile}</td>
                  <td>{patient.therapist_primary}</td>
                  <td>
                    <Link to={`/clinic/${clinic_id}/patients/${patient.id}`}>
                      <Button variant="outline">View Profile</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientList;