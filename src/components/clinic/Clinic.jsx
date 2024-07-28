// Clinic.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from "@/components/ui/progress";
import { useAuth } from '@/contexts/AuthContext';

const Clinic = () => {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(13);
  const { authenticatedFetch } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => setProgress(100), 100);
    fetchClinics();
    return () => clearTimeout(timer);
  }, []);

  const fetchClinics = async () => {
    try {
      const [patResponse, empResponse] = await Promise.all([
        authenticatedFetch(`${import.meta.env.VITE_BASE_URL}/api/pat/clinic/`),
        authenticatedFetch(`${import.meta.env.VITE_BASE_URL}/api/emp/clinic/`)
      ]);

      if (!patResponse.ok || !empResponse.ok) {
        throw new Error('Failed to fetch clinics');
      }

      const patData = await patResponse.json();
      const empData = await empResponse.json();

      // Combine and deduplicate the data
      const combinedClinics = [...patData, ...empData];
      const uniqueClinics = Array.from(new Set(combinedClinics.map(c => c.id)))
        .map(id => {
          const clinic = combinedClinics.find(c => c.id === id);
          return {
            ...clinic,
            joined: patData.some(c => c.id === id)
          };
        });

      setClinics(uniqueClinics);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      toast({
        title: "Error",
        description: "Failed to fetch clinics. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddClinic = () => {
    navigate('/add-clinic');
  };

  if (loading) {
    return (
      <div className="w-full flex flex-col items-center justify-center">
        <Progress value={progress} className="w-[60%]" />
        <p className="mt-4 text-sm text-gray-500">Loading clinics...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>;
  }

  return (
    <Card className="w-full max-w-4xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          {clinics.length !== 0 ? (
            <div className='flex justify-between items-center'>
              <p>Clinics</p>
              <Button onClick={handleAddClinic}>Add Clinic</Button>
            </div>
          ) : (
            <p>Clinics</p>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {clinics.length === 0 ? (
          <div className="text-center py-4">
            <p className='mb-4'>No clinics found.</p>
            <Button onClick={handleAddClinic}>Add your first Clinic</Button>
          </div>
        ) : (
          <ul className="space-y-4">
            {clinics.map(clinic => (
              <li key={clinic.id} className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
                <div>
                  <h3 className="font-semibold">{clinic.name}</h3>
                  <p className="text-sm text-gray-500">{clinic.address_line_1}, {clinic.city}</p>
                  <p className="text-xs text-gray-400">{clinic.joined ? 'Joined' : 'Not Joined'}</p>
                </div>
                <Link to={`/clinic/${clinic.id}/`}>
                  <Button variant="outline">Manage</Button>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default Clinic;