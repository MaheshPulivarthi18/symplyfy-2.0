// dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Filter, ArrowUpDown, Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { DataTable } from "@/components/ui/data-table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import employee from "../../assets/employee.svg";
import patient from "../../assets/patient.svg";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import DoctorVisitCounts from './DoctorVisitsCount';

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
    canceledBookings: 0,
    receivedAppointments: 0,
  });
  const [visits, setVisits] = useState([]);
  const [dateRange, setDateRange] = useState('today');
  const [employeeDetails, setEmployeeDetails] = useState({});
  const [sellableDetails, setSellableDetails] = useState({});
  const [doctors, setDoctors] = useState([]);
  const [showVisitsTable, setShowVisitsTable] = useState(false);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [patients, setPatients] = useState([]);

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

  const getDateRange = () => {
    const now = new Date();
    switch (dateRange) {
      case 'today':
        return { start: startOfDay(now), end: endOfDay(now) };
      case 'yesterday':
        const yesterday = new Date(now.setDate(now.getDate() - 1));
        return { start: startOfDay(yesterday), end: endOfDay(yesterday) };
      case 'thisWeek':
        return { start: startOfWeek(now), end: endOfWeek(now) };
      case 'thisMonth':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'thisYear':
        return { start: startOfYear(now), end: endOfYear(now) };
      default:
        return { start: startOfDay(now), end: endOfDay(now) };
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

  const fetchSellableDetails = async (sellableId) => {
    if (sellableDetails[sellableId]) return;

    try {
      const response = await fetchWithTokenHandling(`${import.meta.env.VITE_BASE_URL}/api/emp/clinic/${clinic_id}/sellable/${sellableId}/`);
      setSellableDetails(prev => ({ ...prev, [sellableId]: response }));
    } catch (error) {
      console.error('Failed to fetch sellable details:', error);
    }
  };


  const fetchVisits = async () => {
    try {
      const { start, end } = getDateRange();
      const response = await fetchWithTokenHandling(`${import.meta.env.VITE_BASE_URL}/api/emp/clinic/${clinic_id}/visit/?date_from=${start.toISOString().split('T')[0]}&date_to=${end.toISOString().split('T')[0]}`);
      setVisits(response);
      setSummary(prevSummary => ({ ...prevSummary, visits: response.length }));
      
      const uniqueEmployeeIds = [...new Set(response.map(visit => visit.employee))];
      await Promise.all(uniqueEmployeeIds.map(fetchEmployeeDetails));
      
      const uniqueSellableIds = [...new Set(response.map(visit => visit.sellable))];
      await Promise.all(uniqueSellableIds.map(fetchSellableDetails));
    } catch (error) {
      console.error('Failed to fetch visits:', error);
    }
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const { start, end } = getDateRange();
      
      // Fetch main bookings
      const response = await authenticatedFetch(`${import.meta.env.VITE_BASE_URL}/api/emp/clinic/${clinic_id}/schedule/booking/?date_from=${start.toISOString()}&date_to=${end.toISOString()}`);
      if (!response.ok) throw new Error('Failed to fetch bookings');
      const data = await response.json();
  
      // Use a Map to store unique bookings by ID
      const bookingsMap = new Map(data.map(booking => [booking.id, booking]));
  
      // Fetch patient bookings and add only if not already present
      for (const patient of patients) {
        const patResponse = await authenticatedFetch(`${import.meta.env.VITE_BASE_URL}/api/emp/clinic/${clinic_id}/patient/${patient.id}/booking/?date_from=${start.toISOString()}&date_to=${end.toISOString()}`);
        if (!patResponse.ok) throw new Error('Failed to fetch patient bookings');
        const patientBookings = await patResponse.json();
        patientBookings.forEach(booking => {
          if (!bookingsMap.has(booking.id)) {
            bookingsMap.set(booking.id, booking);
          }
        });
      }
  
      // Convert Map back to array
      const finalData = Array.from(bookingsMap.values());
  
      // Format the combined data
      const formattedAppointments = finalData.map(booking => ({
        id: booking.id,
        patientName: `${booking.patient.first_name} ${booking.patient.last_name}`,
        doctorName: `${booking.employee.first_name} ${booking.employee.last_name === null ? "" : booking.employee.last_name}`,
        start: new Date(booking.start),
        end: new Date(booking.end),
        patientId: booking.patient.id,
        doctorId: booking.employee.id,
        service: booking.sellable,
        status_patient: booking.status_patient,
        status_employee: booking.status_employee,
        recurrence: booking.recurrence
      }));
  
      setAppointments(formattedAppointments);
      updateFilteredAppointments(formattedAppointments, selectedDoctor);
      setSummary(prevSummary => ({
        ...prevSummary,
        upcomingAppointments: formattedAppointments.filter(app => (app.status_patient === 'C' || app.status_employee === 'P') && (app.status_employee === 'C' || app.status_employee === 'P')).length,
        canceledBookings: formattedAppointments.filter(app => app.status_patient === 'X' || app.status_employee === 'X').length,
        receivedAppointments: formattedAppointments.filter(app => app.status_patient === 'P' && app.status_employee === 'P').length,
      }));
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      toast({
        title: "Error",
        description: "Failed to fetch appointments. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await authenticatedFetch(`${import.meta.env.VITE_BASE_URL}/api/emp/clinic/${clinic_id}/patient/`);
        if (!response.ok) throw new Error('Failed to fetch patients');
        const data = await response.json();
        setPatients(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch patients. Please try again.",
          variant: "destructive",
        });
      }
    };
  
    fetchPatients();
  }, [clinic_id]);

  const updateFilteredAppointments = (appointments, doctorId) => {
    const now = new Date();
    const endOfToday = endOfDay(now);
    const filtered = appointments
      .filter(app => 
        (!doctorId || app.doctorId === doctorId) &&
        new Date(app.start) > now &&
        new Date(app.start) <= endOfToday
      )
      .sort((a, b) => new Date(a.start) - new Date(b.start))
      .slice(0, 3);
    setFilteredAppointments(filtered);
  };

  useEffect(() => {
    updateFilteredAppointments(appointments, selectedDoctor);
  }, [selectedDoctor, appointments]);

  const refreshAppointments = async () => {
    setLoading(true);
    await fetchAppointments();
    setLoading(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchVisits(), fetchAppointments()]);
      setProgress(100);
      setLoading(false);
      setIsVisible(true);
    };

    fetchData();
  }, [dateRange, selectedDoctor]);

  const VisitsDataTable = ({ data }) => {
    const columns = [
      {
        accessorKey: "date",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => format(parseISO(row.getValue("date")), 'EEEE dd MMMM yyyy'),
      },
      {
        accessorKey: "time",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Time
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
      },
      {
        accessorKey: "doctor",
        header: "Doctor",
        cell: ({ row }) => row.getValue("doctor"),
      },
      {
        accessorKey: "service",
        header: "Service",
        cell: ({ row }) => row.getValue("service"),
      },
      {
        accessorKey: "duration",
        header: "Duration",
        cell: ({ row }) => `${row.getValue("duration")} minutes`,
      },
      {
        accessorKey: "walk_in",
        header: "Walk-in",
        cell: ({ row }) => row.getValue("walk_in") ? "Yes" : "No",
      },
      {
        accessorKey: "penalty",
        header: "Penalty",
        cell: ({ row }) => row.getValue("penalty") ? "Yes" : "No",
      },
    ];
  
    const processedData = data.map(visit => ({
      ...visit,
      doctor: employeeDetails[visit.employee] 
        ? `${employeeDetails[visit.employee].first_name} ${employeeDetails[visit.employee].last_name}`
        : 'Loading...',
      service: sellableDetails[visit.sellable]
        ? sellableDetails[visit.sellable].name
        : 'Loading...',
    }));

    const doctorVisitCounts = processedData.reduce((acc, visit) => {
      const doctorName = visit.doctor;
      acc[doctorName] = (acc[doctorName] || 0) + 1;
      return acc;
    }, {});
  
    return (
      <>
        <div className="space-y-4">
          <div className="flex justify-end">
            <DoctorVisitCounts data={processedData} />
          </div>
          <DataTable
            columns={columns}
            data={processedData}
            searchableColumns={[
              {
                id: "doctor",
                title: "Doctor",
              },
            ]}
            rowsPerPage={7}
          />
        </div>
      </>
    );
  };


  return (
    <Card className={`mx-auto flex flex-col gap-4 p-4 w-full h-full shadow-xl transition-all duration-500 ease-out ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>  
      <section className="flex h-1/2 gap-4">
          <Card className="flex-1 shadow-inner bg-gray-50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                Today's Appointments ({appointments.filter(app => 
                  new Date(app.start).toDateString() === new Date().toDateString()
                ).length}) 
                <RefreshCw size={18} onClick={refreshAppointments} className="cursor-pointer" />
              </CardTitle>
              <Select 
                value={selectedDoctor} 
                onValueChange={(value) => setSelectedDoctor(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a doctor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>All Doctors</SelectItem>
                  {doctors.map(doctor => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.first_name} {doctor.last_name}
                    </SelectItem>
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
                ) : filteredAppointments.length === 0 ? (
                  "No upcoming appointments for today"
                ) : (
                  <ul className='flex flex-col gap-4'>
                    {filteredAppointments.map(appointment => (
                      <li key={appointment.id}>
                        <Button className="w-full text-left justify-start">
                          {format(appointment.start, 'EEEE dd MMM HH:mm')} - {appointment.doctorName} - {appointment.patientName}
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
            </CardContent>
          </Card>

          <Card className='flex-1 shadow-inner bg-gray-50'>
            <CardHeader className='flex flex-row align-middle items-center justify-between'>
              <CardTitle className="text-lg font-bold">Summary</CardTitle>
              <div className="flex justify-end gap-6 mb-4">
              <Button variant="outline" onClick={() => navigate(`/clinic/${clinic_id}/schedule`)}>
                <Calendar className="mr-2 h-4 w-4" />
                View Schedule/Calendar
              </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> Filter</Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56">
                    <Select value={dateRange} onValueChange={(value) => {
                      setDateRange(value);
                      // This will trigger a re-fetch of data and update of the summary
                    }}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select date range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="yesterday">Yesterday</SelectItem>
                        <SelectItem value="thisWeek">This Week</SelectItem>
                        <SelectItem value="thisMonth">This Month</SelectItem>
                        <SelectItem value="thisYear">This Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </PopoverContent>
                </Popover>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(summary).map(([key, value]) => (
                  <div key={key} className="border rounded-md p-2 shadow-inner">
                    <div className="text-sm text-gray-600">{key}</div>
                    {key === 'visits' ? (
                      <Dialog>
                        <DialogTrigger asChild>
                          <div className="text-2xl font-bold cursor-pointer">{value}</div>
                        </DialogTrigger>
                        <DialogContent className="max-w-5xl"> {/* Increased max-width */}
                          <DialogHeader>
                            <DialogTitle>Visits</DialogTitle>
                          </DialogHeader>
                          <VisitsDataTable data={visits} />
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <div className="text-2xl font-bold">{value}</div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <div className=" h-1/2 grid grid-cols-2 gap-4">
          <Card className="text-center h-full cursor-pointer shadow-inner bg-gray-50" onClick={() => navigate(`/clinic/${clinic_id}/employees`)}>
            <CardContent className="p-4 relative h-full flex justify-between">
              <img src={employee} alt="Employees" className="mx-auto object-fill mb-2" />
              <Button className=" absolute rounded-md py-1 bottom-6 right-[44.45%]">Employees</Button>
            </CardContent>
          </Card>
          <Card className="text-center h-full cursor-pointer shadow-inner bg-gray-50" onClick={() => navigate(`/clinic/${clinic_id}/patients`)}>
            <CardContent className="p-4 relative h-full flex justify-between">
              <img src={patient} alt="Patients" className="mx-auto object-fill mb-2" />
              <Button className=" absolute rounded-md py-1 bottom-6 right-[44.45%]">Patients</Button>
            </CardContent>
          </Card>
        </div>
    </Card>
  );
};

export default Dashboard;