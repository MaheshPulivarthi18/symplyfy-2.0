// dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { DatePicker } from "@/components/ui/datepicker";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import employee from "../../assets/employee.svg";
import patient from "../../assets/patient.svg";
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from 'date-fns';

const Dashboard = () => {
  const { clinic_id } = useParams();
  const navigate = useNavigate();
  const { authenticatedFetch } = useAuth();

  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [summary, setSummary] = useState({
    visits: 0,
    upcomingAppointments: 0,
  });
  const [visits, setVisits] = useState([]);
  const [dateFrom, setDateFrom] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)));
  const [dateTo, setDateTo] = useState(new Date());
  const [employeeDetails, setEmployeeDetails] = useState({});
  const [doctors, setDoctors] = useState([]);

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
      }, 50);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const fetchWithTokenHandling = async (url, options = {}) => {
    try {
      const response = await authenticatedFetch(url, options);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'An error occurred');
      }
      return response.json();
    } catch (error) {
      if (error.message === 'Token is blacklisted' || error.message === 'Token is invalid or expired') {
        navigate('/login');
        throw new Error('Session expired. Please log in again.');
      }
      throw error;
    }
  };

  const fetchVisits = async () => {
    try {
      const response = await fetchWithTokenHandling(`${import.meta.env.VITE_BASE_URL}/api/emp/clinic/${clinic_id}/visit/?date_from=${dateFrom.toISOString().split('T')[0]}&date_to=${dateTo.toISOString().split('T')[0]}`);
      setVisits(response);
      setSummary(prevSummary => ({ ...prevSummary, visits: response.length }));
      
      const uniqueEmployeeIds = [...new Set(response.map(visit => visit.employee))];
      await Promise.all(uniqueEmployeeIds.map(fetchEmployeeDetails));
      console.log(employeeDetails)
    } catch (error) {
      console.error('Failed to fetch visits:', error);
    }
  };

  const fetchEmployeeDetails = async (employeeId) => {
    if (employeeDetails[employeeId]) return;

    try {
      const response = await fetchWithTokenHandling(`${import.meta.env.VITE_BASE_URL}/api/emp/clinic/${clinic_id}/employee/${employeeId}/`);
      setEmployeeDetails(prev => ({ ...prev, [employeeId]: response }));
      if (response.is_therapist) {
        setDoctors(prev => [...prev, response]);
      }
    } catch (error) {
      console.error('Failed to fetch employee details:', error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await fetchWithTokenHandling(`${import.meta.env.VITE_BASE_URL}/api/emp/clinic/${clinic_id}/schedule/booking/?date_from=${new Date().toISOString()}`);
      setAppointments(response);
      setSummary(prevSummary => ({ ...prevSummary, upcomingAppointments: response.length }));
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    }
  };

  const refreshAppointments = async () => {
    setLoading(true);
    await fetchAppointments();
    setLoading(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchVisits(), fetchAppointments()]);
      console.log(appointments)
      setProgress(100);
      setLoading(false);
      setIsVisible(true);
    };

    fetchData();
  }, [dateFrom, dateTo]);

  if (loading) {
    return (
      <div className="w-full flex flex-col items-center justify-center">
        <Progress value={progress} className="w-[60%]" />
        <p className="mt-4 text-sm text-gray-500">Loading dashboard... {Math.round(progress)}%</p>
      </div>
    );
  }

  return (
    <Card className={`container mx-auto p-4 w-full shadow-xl transition-all duration-500 ease-out ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>  
      <main className={`space-y-6`}>
        <section className="flex gap-4">
          <Card className="flex-1 shadow-inner bg-gray-50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                Today's Appointments ({appointments.length}) 
                <RefreshCw size={18} onClick={refreshAppointments} className="cursor-pointer" />
              </CardTitle>
              <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map(doctor => (
                    <SelectItem key={doctor.id} value={doctor.id}>{doctor.first_name} {doctor.last_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent className="p-4 rounded-md">
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : appointments.length === 0 ? (
                "No upcoming appointments"
              ) : (
                <ul className='flex flex-col gap-4'>
                  {appointments.slice(0, 2).map(appointment => (
                    <li key={appointment.id}>
                      <Button className="w-full text-left justify-start">
                        {format(parseISO(appointment.start), 'HH:mm')} - {employeeDetails[appointment.employee.id]?.first_name} {employeeDetails[appointment.employee.id]?.last_name} - {appointment.patient.first_name+" "+appointment.patient.last_name}
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className='flex-1 shadow-inner bg-gray-50'>
            <CardHeader className='flex flex-row align-middle justify-between'>
              <CardTitle className="text-lg font-semibold">Summary</CardTitle>
              <Link to={`/clinic/${clinic_id}/schedule`} className="text-blue-600 hover:underline">View all</Link>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <DatePicker
                  value={dateFrom}
                  onChange={(date) => setDateFrom(date)}
                  placeholderText="Date From"
                />
                <DatePicker
                  value={dateTo}
                  onChange={(date) => setDateTo(date)}
                  placeholderText="Date To"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(summary).map(([key, value]) => (
                  <div key={key} className="border rounded-md p-2 shadow-inner">
                    <div className="text-sm text-gray-600">{key}</div>
                    <div className="text-2xl font-bold">{value}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <div className="grid grid-cols-2 gap-4">
          <Card className="text-center cursor-pointer shadow-inner bg-gray-50" onClick={() => navigate(`/clinic/${clinic_id}/employees`)}>
            <CardContent className="p-4">
              <img src={employee} alt="Employees" className="mx-auto mb-2" />
              <Button className="w-full rounded-md py-1">Employees</Button>
            </CardContent>
          </Card>
          <Card className="text-center cursor-pointer shadow-inner bg-gray-50" onClick={() => navigate(`/clinic/${clinic_id}/patients`)}>
            <CardContent className="p-4">
              <img src={patient} alt="Patients" className="mx-auto mb-2" />
              <Button className="w-full rounded-md py-1">Patients</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </Card>
  );
};

export default Dashboard;