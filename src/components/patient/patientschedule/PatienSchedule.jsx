// PatientSchedule.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const visits = [
  { id: 1, patientId: 1, date: '2023-07-15', type: 'Checkup', status: 'Completed' },
  { id: 2, patientId: 1, date: '2023-08-20', type: 'Follow-up', status: 'Scheduled' },
  { id: 3, patientId: 1, date: '2023-06-10', type: 'Consultation', status: 'Incomplete' },
  // Add more visits as needed
];

const PatientSchedule = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('all');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);


  const patientVisits = visits.filter(v => v.patientId === parseInt(id));

  const filteredVisits = {
    all: patientVisits,
    upcoming: patientVisits.filter(v => new Date(v.date) >= new Date() && v.status === 'Scheduled'),
    visited: patientVisits.filter(v => v.status === 'Completed'),
    incomplete: patientVisits.filter(v => v.status === 'Incomplete'),
  };

  return (
    <Card className={`w-full mt-8 container mx-auto p-4 shadow-xl transition-all duration-500 ease-out ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
    {/* {``} */}
      <CardHeader>
        <CardTitle>Patient Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Appointments</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="visited">Visited</TabsTrigger>
            <TabsTrigger value="incomplete">Incomplete</TabsTrigger>
          </TabsList>
          {Object.entries(filteredVisits).map(([key, visits]) => (
            <TabsContent key={key} value={key}>
              <ul className="space-y-2">
                {visits.map(visit => (
                  <li key={visit.id} className="p-2 bg-gray-100 rounded">
                    {visit.date} - {visit.type} ({visit.status})
                  </li>
                ))}
              </ul>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PatientSchedule;