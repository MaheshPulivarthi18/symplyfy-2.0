// schedule.jsx
import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import parse from 'date-fns/parse';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import AppointmentPopup from './Appointment';
import './Schedule.css'
import '../../index.css'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isSameMonth, startOfDay, endOfDay, isSameDay, addWeeks, addMonths, isBefore } from 'date-fns';
import { Toggle } from '../ui/toggle';
import { Button } from '../ui/button';
import TimePicker from '../ui/timepicker';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { PlusCircle, Search } from "lucide-react";
import { Card } from '../ui/card';
import { useToast } from "@/components/ui/use-toast";
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { parseISO, addMinutes } from 'date-fns';
import { DatePicker } from '@/components/ui/datepicker';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from '@/components/ui/progress';
import ClockPicker from '@/components/ui/clock';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function Schedule() {
  const [events, setEvents] = useState([]);
  const [view, setView] = useState('day');
  const [date, setDate] = useState(new Date());
  // const [isModalOpen, setIsVisitDialogOpen] = useState(false);
  const [isCustomDuration, setIsCustomDuration] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({
    id: null,
    patient: '',
    doctor: '',
    service: '',
    date: new Date(),
    time: new Date(),
    frequency: 'does not repeat',
    duration: 30,
  });
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [showCanceled, setShowCanceled] = useState(false);
  const [calendarStartTime, setCalendarStartTime] = useState(new Date(0, 0, 0, 9, 0));
  const [calendarEndTime, setCalendarEndTime] = useState(new Date(0, 0, 0, 21, 0));
  const [breakStartTime, setBreakStartTime] = useState(new Date(0, 0, 0, 12, 0));
  const [breakEndTime, setBreakEndTime] = useState(new Date(0, 0, 0, 13, 0));
  const [therapists, setTherapists] = useState([]);
  const [patients, setPatients] = useState([]);
  const {clinic_id} = useParams();
  const { authenticatedFetch } = useAuth()
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [workingHours, setWorkingHours] = useState({});
  const [sellables, setSellables] = useState([]);
  const [isVisitDialogOpen, setIsVisitDialogOpen] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [newVisit, setNewVisit] = useState({
    patient: '',
    patientName: '',
    sellable: '',
    date: new Date(),
    time: '06:00',
    frequency: 'does_not_repeat',
    weekdays: [],
    endsOn: '',
    sessions: '',
    duration: 30,
    customDuration: '',
    therapist: '',
    therapistName: '',
  });
  const [showCancelled, setShowCancelled] = useState(false);
  const [doctorSearch, setDoctorSearch] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [therapistSearch, setTherapistSearch] = useState('');

  const filteredTherapists = therapists.filter(therapist => 
    `${therapist.first_name} ${therapist.last_name}`.toLowerCase().includes(doctorSearch.toLowerCase())
  );
  
  const filteredPatients = patients.filter(patient => 
    `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(patientSearch.toLowerCase())
  );

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
    fetchTherapists();
    fetchPatients();
    fetchSettings();
    fetchSellables();
  }, [clinic_id]);

  useEffect(() => {
    if (patients.length > 0) {
      fetchBookings();
    }
  }, [patients]);

  const fetchTherapists = async () => {
    try {
      const response = await authenticatedFetch(`${import.meta.env.VITE_BASE_URL}/api/emp/clinic/${clinic_id}/employee/`);
      if (!response.ok) throw new Error('Failed to fetch therapists');
      const data = await response.json();
      const therapistList = data.filter(employee => employee.is_therapist);
      setTherapists(therapistList);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch therapists. Please try again.",
        variant: "destructive",
      });
    }
  };

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

  const fetchSettings = async () => {
    try {
      const response = await authenticatedFetch(`${import.meta.env.VITE_BASE_URL}/api/emp/clinic/${clinic_id}/schedule/settings/`);
      if (!response.ok) throw new Error('Failed to fetch settings');
      const data = await response.json();
      if (data.working_hours) {
        setWorkingHours(data.working_hours);
        
        // Set initial times based on Monday's schedule
        const mondaySchedule = data.working_hours['1'];
        
        setCalendarStartTime(new Date(0, 0, 0, ...mondaySchedule.morning.start.split(':').map(Number)));
        setCalendarEndTime(new Date(0, 0, 0, ...mondaySchedule.afternoon.end.split(':').map(Number)));
        setBreakStartTime(new Date(0, 0, 0, ...mondaySchedule.morning.end.split(':').map(Number)));
        setBreakEndTime(new Date(0, 0, 0, ...mondaySchedule.afternoon.start.split(':').map(Number)));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch settings. Please try again.",
        variant: "destructive",
      });
    }
  };


  const fetchBookings = async () => {
    try {
      // Fetch main bookings
      const response = await authenticatedFetch(`${import.meta.env.VITE_BASE_URL}/api/emp/clinic/${clinic_id}/schedule/booking/`);
      if (!response.ok) throw new Error('Failed to fetch bookings');
      const data = await response.json();
  
      // Use a Map to store unique bookings by ID
      const bookingsMap = new Map(data.map(booking => [booking.id, booking]));
  
      // Fetch patient bookings and add only if not already present
      for (const patient of patients) {
        const patResponse = await authenticatedFetch(`${import.meta.env.VITE_BASE_URL}/api/emp/clinic/${clinic_id}/patient/${patient.id}/booking/`);
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
  
      console.log("Final bookings data:", finalData);
  
      // Format the combined data
      const formattedEvents = finalData.map(booking => ({
        id: booking.id,
        title: `${booking.patient.first_name} ${booking.patient.last_name}`,
        start: new Date(booking.start),
        end: new Date(booking.end),
        patientId: booking.patient.id,
        patientName: `${booking.patient.first_name} ${booking.patient.last_name}`,
        doctorId: booking.employee.id,
        doctorName: `${booking.employee.first_name} ${booking.employee.last_name === null ? "" : booking.employee.last_name}`,
        service: booking.sellable,
        resourceId: booking.employee.id,
        status_patient: booking.status_patient,
        status_employee: booking.status_employee,
        recurrence: booking.recurrence
      }));
  
      setEvents(formattedEvents);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch bookings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  

  const fetchSellables = async () => {
    try {
      const data = await authenticatedFetch(`${import.meta.env.VITE_BASE_URL}/api/emp/clinic/${clinic_id}/sellable/`);
      const sellableData = await data.json()
      console.log(sellableData)
      setSellables(sellableData);
    } catch (error) {
      console.error("Failed to fetch sellables:", error);
      setSellables([]);
    }
  };  

  const handleReschedule = (event) => {
    const eventDate = new Date(event.start);
    setNewVisit({
      id: event.id,
      patient: event.patientId,
      patientName: event.patient,
      therapist: event.doctorId,
      therapistName: event.doctor,
      sellable: event.service,
      date: isNaN(eventDate) ? new Date() : eventDate,
      time: format(isNaN(eventDate) ? new Date() : eventDate, 'HH:mm'),
      frequency: 'does_not_repeat',
      weekdays: [],
      endsOn: '',
      sessions: '',
      duration: (new Date(event.end) - new Date(event.start)) / (1000 * 60),
      customDuration: '',
    });
    setIsRescheduling(true);
    setIsVisitDialogOpen(true);
  };
  
  // Then, create a separate function to handle the actual rescheduling
  const submitReschedule = async () => {
    try {
        // Use the date from newVisit.date and combine it with the time
        const [hours, minutes] = newVisit.time.split(':').map(Number);
        const localStartDateTime = new Date(newVisit.date);
        localStartDateTime.setHours(hours, minutes, 0, 0);

        // Calculate the duration in minutes
        const durationInMinutes = newVisit.duration || parseInt(newVisit.customDuration);

        // Calculate end time
        const localEndDateTime = new Date(localStartDateTime.getTime() + durationInMinutes * 60000);

        // Format dates as ISO strings, but remove the 'Z' to keep them as local time
        const formatLocalDate = (date) => date.toISOString().slice(0, -1);
        console.log(formatLocalDate(localStartDateTime), localEndDateTime, durationInMinutes, newVisit.date, newVisit.time);

        // Convert weekdays to the format expected by the backend (e.g., "MO,TU,WE")
        const weekdayMap = {
          'Mon': 'MO', 'Tue': 'TU', 'Wed': 'WE', 'Thu': 'TH', 'Fri': 'FR', 'Sat': 'SA', 'Sun': 'SU'
        };
        const formattedWeekdays = newVisit.weekdays.map(day => weekdayMap[day]).join(',');
  
        let recurrenceRule = null;
        if (newVisit.frequency === 'weekly') {
          recurrenceRule = `RRULE:FREQ=WEEKLY;BYDAY=${formattedWeekdays}`;
          if (newVisit.endsOn) {
            const endDate = parseISO(newVisit.endsOn);
            console.log(endDate)
            recurrenceRule += `;UNTIL=${format(endDate, "yyyyMMdd'T'HHmmss'Z'")}`;
          } else if (newVisit.sessions) {
            recurrenceRule += `;COUNT=${newVisit.sessions}`;
          }
        }
        const bookingData = {
          start: formatLocalDate(localStartDateTime),
          end: formatLocalDate(localEndDateTime),
          patient: newVisit.patient,
          employee: newVisit.therapist,
          sellable: newVisit.sellable,
          recurrence: recurrenceRule,
          actor: "E",
        };
        console.log(bookingData, "Rescheduling Appointment");
        const response = await authenticatedFetch(`${import.meta.env.VITE_BASE_URL}/api/emp/clinic/${clinic_id}/schedule/booking/${newVisit.id}/reschedule/`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },      
          body: JSON.stringify(bookingData),      
        });

        if (!response.ok) throw new Error('Failed to reschedule appointment');
  
        const updatedBooking = await response.json();
        // setEvents(events.map(event => event.id === newVisit.id ? updatedBooking : event));
        await fetchBookings();

        setEvents(prevEvents => prevEvents.map(event => 
          event.id === newVisit.id ? updatedBooking : event
        ));
        setNewVisit({
          patient: '',
          sellable: '',
          date: '',
          time: '',
          frequency: 'does_not_repeat',
          weekdays: [],
          endsOn: '',
          sessions: '',
          duration: 30,
          customDuration: '',
          therapist: '',
        });
        setIsRescheduling(false);
        setIsVisitDialogOpen(false);
        toast({
          title: "Success",
          description: "Appointment rescheduled successfully.",
          variant: "default",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
      }); 
    }  
  };

  const handleCancel = async (eventToCancel, cancelScope, tillDate = null) => {
    console.log(eventToCancel);
    try {
      const cancelData = {
        actor: 'E',
        scope: cancelScope,
      };
  
      // Only include till_date if it's provided and scope is 'D'
      if (cancelScope === 'D' && tillDate) {
        cancelData.till_date = tillDate.toISOString();
      }
  
      const response = await authenticatedFetch(`${import.meta.env.VITE_BASE_URL}/api/emp/clinic/${clinic_id}/schedule/booking/${eventToCancel.id}/cancel/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cancelData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cancel appointment');
      }
  
      const canceledAppointment = await response.json();
      
      // Update the local state to reflect the cancellation
      await fetchBookings();
      setEvents(prevEvents => prevEvents.map(event => 
        event.id === canceledAppointment.id 
          ? { ...event, status_patient: 'X', status_employee: 'X' } 
          : event
      ));
  
      setSelectedEvent(null);
      toast({
        title: "Success",
        description: "Appointment(s) cancelled successfully.",
        variant: "default",
      });
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to cancel appointment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (eventToDelete, deleteScope) => {
    try {
      const url = `${import.meta.env.VITE_BASE_URL}/api/emp/clinic/${clinic_id}/schedule/booking/${eventToDelete.id}/delete/`;
      const queryParams = deleteScope === '1' ? `?scope=${eventToDelete.recurrence}` : '';
  
      const response = await authenticatedFetch(`${url}${queryParams}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) throw new Error('Failed to delete appointment');

      await fetchBookings();
      setSelectedEvent(null);
      toast({
        title: "Success",
        description: deleteScope === 'recurrence' ? "All recurring appointments deleted successfully." : "Appointment deleted successfully.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete appointment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleMarkVisit = async (bookingId, visitDetails) => {
    try {
      const response = await authenticatedFetch(`${import.meta.env.VITE_BASE_URL}/api/emp/clinic/${clinic_id}/schedule/booking/${bookingId}/confirm/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          actor: 'E',
          // visited_time: visitDetails.visitedTime,
          // product: visitDetails.product,
          // walk_in: visitDetails.walkIn,
          // mark_penalty: visitDetails.markPenalty,
          // remove_session_balance: visitDetails.removeSessionBalance,
        }),
      });

      if (!response.ok) throw new Error('Failed to mark visit');

      const updatedBooking = await response.json();
      
      // Update the local state to mark the event as attended
      setEvents(prevEvents => prevEvents.map(event => 
        event.id === bookingId 
          ? { ...event, ...updatedBooking, attended: true }
          : event
      ));
      await fetchBookings();
      
      toast({
        title: "Success",
        description: "Visit marked successfully.",
        variant: "default",
      });
    } catch (error) {
      console.error('Error marking visit:', error);
      toast({
        title: "Error",
        description: "Failed to mark visit. Please try again.",
        variant: "destructive",
      });
    }
  };

  const addVisit = async () => {
    try {
      // Use the date from newVisit.date and combine it with the time
      const [hours, minutes] = newVisit.time.split(':').map(Number);
      const localStartDateTime = new Date(newVisit.date);
      localStartDateTime.setHours(hours, minutes, 0, 0);
      
      // Calculate the duration in minutes
      const durationInMinutes = newVisit.duration || parseInt(newVisit.customDuration);
      
      // Calculate end time
      const localEndDateTime = new Date(localStartDateTime.getTime() + durationInMinutes * 60000);
      
      
      // Format dates as ISO strings, but remove the 'Z' to keep them as local time
      const formatLocalDate = (date) => date.toISOString().slice(0, -1);
      console.log(formatLocalDate(localStartDateTime), localEndDateTime, durationInMinutes, newVisit.date, newVisit.time);
      
      // Convert weekdays to the format expected by the backend (e.g., "MO,TU,WE")
      const weekdayMap = {
        'Mon': 'MO', 'Tue': 'TU', 'Wed': 'WE', 'Thu': 'TH', 'Fri': 'FR', 'Sat': 'SA', 'Sun': 'SU'
      };
      const formattedWeekdays = newVisit.weekdays.map(day => weekdayMap[day]).join(',');
  
      let recurrenceRule = null;
      if (newVisit.frequency === 'weekly') {
        recurrenceRule = `RRULE:FREQ=WEEKLY;BYDAY=${formattedWeekdays}`;
        if (newVisit.endsOn) {
          const endDate = parseISO(newVisit.endsOn);
          console.log(endDate)
          recurrenceRule += `;UNTIL=${format(endDate, "yyyyMMdd'T'HHmmss'Z'")}`;
        } else if (newVisit.sessions) {
          recurrenceRule += `;COUNT=${newVisit.sessions}`;
        }
      }

      const bookingData = {
        start: formatLocalDate(localStartDateTime),
        end: formatLocalDate(localEndDateTime),
        patient: newVisit.patient,
        employee: newVisit.therapist,
        sellable: newVisit.sellable,
        recurrence: recurrenceRule,
        actor: "E",
      };

      console.log(bookingData);

      const response = await authenticatedFetch(`${import.meta.env.VITE_BASE_URL}/api/emp/clinic/${clinic_id}/schedule/booking/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        throw new Error(isRescheduling ? 'Failed to reschedule appointment' : 'Failed to book appointment');
      }

      const newBooking = await response.json();
      if (isRescheduling) {
        setEvents(events.map(event => event.id === newVisit.id ? newBooking : event));
      } else {
        setEvents([...events, newBooking]);
      }
      await fetchBookings()
      handleDialogOpenChange(false);
      setNewVisit({
        patient: '',
        sellable: '',
        date: '',
        time: '',
        frequency: 'does_not_repeat',
        weekdays: [],
        endsOn: '',
        sessions: '',
        duration: 30,
        customDuration: '',
        therapist: '',
      });
      toast({
        title: "Success",
        description: "Appointment booked successfully.",
        variant: "default",
      });
      setIsVisitDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDialogOpenChange = (open) => {
    setIsVisitDialogOpen(open);
    if (!open) {
      setIsRescheduling(false);
      setNewVisit({
        patient: '',
        patientName: '',
        sellable: '',
        date: new Date(),
        time: '',
        frequency: 'does_not_repeat',
        weekdays: [],
        endsOn: '',
        sessions: '',
        duration: 30,
        customDuration: '',
        therapist: '',
        therapistName: '',
      });
    }
  };

  const handleDoctorFilterChange = (doctorId) => {
    console.log('Selecting doctor:', doctorId);
    setSelectedDoctorId(prev => {
      const newValue = prev === doctorId ? '' : doctorId;
      console.log('New selected doctor ID:', newValue);
      return newValue;
    });
    if (doctorId) {
      setView('week');
    }
  };
  
  const handlePatientFilterChange = (patientId) => {
    console.log('Selecting patient:', patientId);
    setSelectedPatientId(prev => {
      const newValue = prev === patientId ? '' : patientId;
      console.log('New selected patient ID:', newValue);
      return newValue;
    });
    if (patientId) {
      setView('month');
    }
  };
  
  const handleCancelledToggle = () => {
    setShowCancelled(!showCancelled);
    if (!showCancelled) {
      setView('month');
      setSelectedDoctorId('');
      setSelectedPatientId('');
    }
  };
  
  const clearAllFilters = () => {
    setSelectedDoctorId('');
    setSelectedPatientId('');
    setShowCanceled(false);
  };

  // const handleSelect = ({ start, end, resourceId }) => {
  //   if (isWithinBreakTime(start) || isWithinBreakTime(end)) {
  //     toast({
  //       title: "Invalid Selection",
  //       description: "You cannot schedule appointments during break time.",
  //       variant: "destructive",
  //     });
  //     return;
  //   }
  //   setNewVisit(prev => ({ 
  //     ...prev, 
  //     date: format(start, 'yyyy-MM-dd'),
  //     time: format(start, 'HH:mm'),
  //     therapist: resourceId || ''
  //   }));
  //   setIsVisitDialogOpen(true);
  // };

  const handleSelect = ({ start, end, resourceId }) => {
    if (isWithinBreakTime(start) || isWithinBreakTime(end)) {
      toast({
        title: "Invalid Selection",
        description: "You cannot schedule appointments during break time.",
        variant: "destructive",
      });
      return;
    }
    setNewVisit(prev => ({ 
      ...prev, 
      date: start,
      time: format(start, 'HH:mm'),
      therapist: resourceId || ''
    }));
    setIsVisitDialogOpen(true);
  };

  // const handleInputChange = (e) => {
  //   const { name, value } = e.target;
  //   setNewEvent(prev => ({ ...prev, [name]: value }));
  // };

  // const handleDateChange = (date) => {
  //   setNewEvent(prev => ({ ...prev, date }));
  // };

  // const handleTimeChange = (time) => {
  //   setNewEvent(prev => ({ ...prev, time }));
  // };

  // const handleDurationChange = (duration) => {
  //   if (duration === 'custom') {
  //     setIsCustomDuration(true);
  //   } else {
  //     setNewEvent(prev => ({ ...prev, duration: parseInt(duration) }));
  //     setIsCustomDuration(false);
  //   }
  // };

  const handleSelectEvent = (event) => {
    console.log(event)
    setSelectedEvent(event);
  };

  const getDaySchedule = (date) => {
    const dayIndex = date.getDay().toString();
    return workingHours[dayIndex] || workingHours['0']; // Default to Sunday if no schedule found
  };
  
  const updateCalendarTimes = (date) => {
    const schedule = getDaySchedule(date);
    setCalendarStartTime(parseTimeString(schedule.morning.start));
    setCalendarEndTime(parseTimeString(schedule.afternoon.end));
    setBreakStartTime(parseTimeString(schedule.morning.end));
    setBreakEndTime(parseTimeString(schedule.afternoon.start));
  };

  const parseTimeString = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return new Date(0, 0, 0, hours, minutes);
  };

  const handleNavigate = (newDate) => {
    setDate(newDate);
    updateCalendarTimes(newDate);
  };

  const isWithinBreakTime = (time) => {
    const timeMinutes = time.getHours() * 60 + time.getMinutes();
    const breakStartMinutes = breakStartTime.getHours() * 60 + breakStartTime.getMinutes();
    const breakEndMinutes = breakEndTime.getHours() * 60 + breakEndTime.getMinutes();
    return timeMinutes >= breakStartMinutes && timeMinutes < breakEndMinutes;
  };

  const getFilteredResources = () => {
    if (view === 'day') {
      // For day view, return all therapists or the selected one
      return selectedDoctorId 
        ? [therapists.find(t => t.id === selectedDoctorId)].filter(Boolean)
        : therapists;
    }
    if (view === 'week' && selectedDoctorId) {
      return [therapists.find(t => t.id === selectedDoctorId)].filter(Boolean);
    }
    return therapists;
  };


  const filteredEvents = events.filter(event => {
    const doctorMatch = !selectedDoctorId || event.resourceId === selectedDoctorId;
    const patientMatch = !selectedPatientId || event.patientId === selectedPatientId;
    
    const isCancelled = event.status_patient === 'X' || event.status_employee === 'X';
  
    // If showCancelled is true, show only cancelled events
    // If showCancelled is false, show all non-cancelled events
    const statusMatch = showCancelled ? isCancelled : !isCancelled;
  
    return (doctorMatch && patientMatch && statusMatch);
  });

  const formattedFilteredEvents = filteredEvents.map(event => ({
    id: event.id,
    title: event.title,
    start: new Date(event.start),
    end: new Date(event.end),
    resourceId: event.doctorId,
    status_patient: event.status_patient,
    status_employee: event.status_employee,
    attended: event.attended,
    doctor: event.doctorName,
    patient: event.patientName,
    patientId: event.patientId,
    doctorId: event.employeeId,
    service: event.sellable,
    recurrence: event.recurrence
  }));

  // const formattedFilteredEvents = filteredEvents.map(event => ({
  //   id: event.id,
  //   doctor: event.doctorName,
  //   patient: event.patientName,
  //   service: event.service,
  //   title: event.title,
  //   start: new Date(event.start),
  //   end: new Date(event.end),
  //   resourceId: event.doctorId,
  //   allDay: false,
  //   status_patient: event.status_patient,
  //   status_employee: event.status_employee
  // }));

  const ResourceHeader = ({ label }) => {
    return (
    <div className="resource-header flex flex-row justify-center gap-4 text-center">
      <div className="avatar bg-gray-600">
        {label.charAt(0)}
      </div>
      <span>{label}</span>
    </div>
  );}

  const CustomToolbar = (toolbar) => {
    const goToBack = () => {
      toolbar.onNavigate('PREV');
    };
  
    const goToNext = () => {
      toolbar.onNavigate('NEXT');
    };
  
    const goToCurrent = () => {
      toolbar.onNavigate('TODAY');
    };
  
    const label = () => {
      const date = toolbar.date;
      const view = toolbar.view;
  
      if (view === 'month') {
        return format(date, 'MMMM yyyy');
      }
      if (view === 'week') {
        const start = startOfWeek(date);
        const end = endOfWeek(date);
        return `${format(start, 'MMMM d')} - ${format(end, isSameMonth(start, end) ? 'd' : 'MMMM d')}`;
      }
      if (view === 'day') {
        return format(date, 'EEEE, MMMM d');
      }
      return '';
    };
  
    return (
      <div className="rbc-toolbar">
        <span className="rbc-btn-group">
          <button type="button" onClick={goToBack} className="rbc-btn rbc-prev-button">
            <i className="fa-solid fa-angle-left"></i>
          </button>
          <button type="button" onClick={goToCurrent} className="rbc-btn rbc-today-button">
            Today
          </button>
          <button type="button" onClick={goToNext} className="rbc-btn rbc-next-button">
            <i className="fa-solid fa-angle-right"></i>
          </button>
        </span>
        <span className="rbc-toolbar-label">{label()}</span>
        <span className="rbc-btn-group">
          {toolbar.views.map(view => (
            <button
              key={view}
              type="button"
              className={`rbc-btn rbc-${view.toLowerCase()}-button ${view === toolbar.view ? 'rbc-active' : ''}`}
              onClick={() => toolbar.onView(view)}
            >
              {view.charAt(0).toUpperCase() + view.substring(1).toLowerCase()}
            </button>
          ))}
        </span>
      </div>
    );
  };

  const TimeSelect = ({ value, onChange }) => {
    const generateTimeOptions = () => {
      const options = [];
      for (let i = 0; i < 24; i++) {
        for (let j = 0; j < 60; j += 30) {
          const hour = i.toString().padStart(2, '0');
          const minute = j.toString().padStart(2, '0');
          const time = `${hour}:${minute}`;
          options.push(<SelectItem key={time} value={time}>{time}</SelectItem>);
        }
      }
      return options;
    };
  
    return (
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select time" />
        </SelectTrigger>
        <SelectContent>
          {generateTimeOptions()}
        </SelectContent>
      </Select>
    );
  };

  const handleTimeChange = (time) => {
    console.log('Selected time:', time); // Add this for debugging
    setNewVisit(prev => ({ ...prev, time }));
  };

  const SearchableSelect = ({ placeholder, options, value, onValueChange, searchPlaceholder }) => {
    const [search, setSearch] = useState('');
  
    const filteredOptions = options.filter(option =>
      `${option.first_name} ${option.last_name}`.toLowerCase().includes(search.toLowerCase())
    );
  
    return (
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <div className="relative mb-2 p-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
              onKeyDown={(e) => e.stopPropagation()}
            />
          </div>
          {filteredOptions.map(option => (
            <SelectItem key={option.id} value={option.id}>
              {option.first_name} {option.last_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  };

  if (loading) {
    return (
      <div className="w-full flex flex-col items-center justify-center">
        <Progress value={progress} className="w-[60%]" />
        <p className="mt-4 text-sm text-gray-500">Loading schedule... {Math.round(progress)}%</p>
      </div>
    );
  }

  return (
    <Card className="p-4 w-full max-w-[90vw] lg:h-[90vh] shadow-lg">
      <div className='flex flex-col-reverse lg:flex-row-reverse gap-8 lg:gap-8 w-full h-full'>
        <div className="w-full lg:w-[17.75%] flex flex-col h-full">
          <div className="mb-4 flex-shrink-0">
            <Button 
              onClick={() => {
                const now = new Date();
                setNewVisit(prev => ({
                  ...prev,
                  date: now,
                  time: format(now, 'HH:mm'),
                }));
                handleDialogOpenChange(true);
              }} 
              className="flex items-center w-full"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Appointment
            </Button>
          </div>
          <div className="mb-4 flex-shrink-0">
            <div className='flex gap-4 justify-between items-center'>
              <Label htmlFor="startTime">From</Label>
              <ClockPicker
  id="startTime"
  value={format(calendarStartTime, 'HH:mm')}
  onChange={(time) => setCalendarStartTime(parseTimeString(time))}
/>


            </div>
            <div className='flex gap-4 justify-between items-center mt-2'>
              <Label htmlFor="endTime">To</Label>
              <ClockPicker
  id="endTime"
  value={format(calendarEndTime, 'HH:mm')}
  onChange={(time) => setCalendarEndTime(parseTimeString(time))}
/>


            </div>
            <div className='flex gap-4 justify-between items-center mt-2'>
              <Label htmlFor="breakStartTime">Break Start</Label>
              <ClockPicker
  id="breakStartTime"
  value={format(breakStartTime, 'HH:mm')}
  onChange={(time) => setBreakStartTime(parseTimeString(time))}
/>

            </div>
            <div className='flex gap-4 justify-between items-center mt-2'>
              <Label htmlFor="breakEndTime">Break End</Label>

              <ClockPicker
  id="breakEndTime"
  value={format(breakEndTime, 'HH:mm')}
  onChange={(time) => setBreakEndTime(parseTimeString(time))}
/>  
            </div>
          </div>
          <ScrollArea className="flex-grow overflow-y-auto pr-4">
            <Toggle
              pressed={!selectedDoctorId && !selectedPatientId}
              onPressedChange={clearAllFilters}
              className="mb-4 w-full"
            >
              {selectedDoctorId === "" && selectedPatientId === "" ? "Apply Filter" : "Clear All Filters" }
            </Toggle>
              <h1 className='font-bold text-lg mb-2'>Doctors</h1>
              <div className="relative mb-2">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search doctors..."
                  value={doctorSearch}
                  onChange={(e) => setDoctorSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
              <div className="flex flex-col gap-2 mb-4">
                {filteredTherapists.map(therapist => (
                  <Toggle
                    key={therapist.id}
                    pressed={selectedDoctorId === therapist.id}
                    onPressedChange={() => handleDoctorFilterChange(therapist.id)}
                  >
                    {therapist.first_name} {therapist.last_name}
                  </Toggle>
                ))}
              </div>

              <h1 className='font-bold text-lg mb-2'>Patients</h1>
              <div className="relative mb-2">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search patients..."
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
              <div className="flex flex-col gap-2 mb-4">
                {filteredPatients.map(patient => (
                  <Toggle
                    key={patient.id}
                    pressed={selectedPatientId === patient.id}
                    onPressedChange={() => handlePatientFilterChange(patient.id)}
                  >
                    {patient.first_name} {patient.last_name}
                  </Toggle>
                ))}
              </div>


            <Toggle 
            pressed={showCancelled} 
            onPressedChange={handleCancelledToggle} 
            className="w-full"
            >
              {showCancelled ? "Hide Cancelled" : "View Cancelled"}
            </Toggle>
          </ScrollArea>
        </div>
        <div className="bg-white rounded-lg shadow-lg w-full lg:w-[80%]">
          <Calendar
            localizer={localizer}
            events={formattedFilteredEvents}
            startAccessor="start"
            endAccessor="end"
            defaultView={"day"}
            views={["day", "week", "month"]}
            selectable
            resources={getFilteredResources().map(therapist => ({
              id: therapist.id,
              title: `${therapist.first_name} ${therapist.last_name === null ? "" : therapist.last_name}`
            }))}
            resourceIdAccessor="id"
            resourceTitleAccessor="title"
            onSelectSlot={handleSelect}
            onSelectEvent={handleSelectEvent}
            view={view}
            onView={setView}
            date={date}
            // onNavigate={setDate}
            className="font-sans"
            style={{ minHeight: '500px' }}
            components={{
              toolbar: CustomToolbar,
              resourceHeader: ResourceHeader,
            }}
            min={calendarStartTime}
            max={calendarEndTime}
            onNavigate={handleNavigate}
            eventPropGetter={(event) => {
              let backgroundColor = '#3174ad';  // Default blue color
              let textColor = 'white';

              if (event.status_patient === 'X' || event.status_employee === 'X') {
                backgroundColor = 'lightgrey';
                textColor = 'darkgrey';
              } else if (event.attended) {
                backgroundColor = '#4CAF50';  // Green color for attended events
              } else if (event.status_patient === 'C' && event.status_employee === 'C') {
                backgroundColor = '#FFA500';  // Orange color for confirmed events
              }

              return {
                style: {
                  backgroundColor: backgroundColor,
                  color: textColor,
                }
              };
            }}
            dayPropGetter={(date) => ({
              style: {
                backgroundColor: 'white',
              },
            })}
            slotPropGetter={(date) => {
              if (isWithinBreakTime(date)) {
                return {
                  style: {
                    backgroundColor: '#f0f0f0',
                    pointerEvents: 'none',
                    cursor: 'not-allowed',
                  }
                };
              }
              return {};
            }}
          />
        </div>
      </div>

      {selectedEvent && (
        <AppointmentPopup 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)}
          onReschedule={handleReschedule}
          onCancel={handleCancel}
          onDelete={handleDelete}
          onMarkVisit={handleMarkVisit}
          sellables={sellables}  // Pass sellables to AppointmentPopup
        />
      )}
      {/* add appointment */}
      <Dialog open={isVisitDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          {console.log("Dialog rendering with date:", newVisit.date)}
          <DialogHeader>
            <DialogTitle>{isRescheduling ? 'Reschedule Appointment' : 'Add Appointment'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {isRescheduling ? (
              <>
                <div>
                  <Label>{format(new Date(newVisit.date), 'EEEE dd MMMM yyyy')} - {newVisit.time}</Label>
                </div>
              </>
            ) : (
              <>
              <SearchableSelect
                placeholder="Select Patient"
                options={patients}
                value={newVisit.patient}
                onValueChange={(value) => setNewVisit({...newVisit, patient: value})}
                searchPlaceholder="Search patients..."
              />

              <SearchableSelect
                placeholder="Select Therapist"
                options={therapists}
                value={newVisit.therapist}
                onValueChange={(value) => setNewVisit({...newVisit, therapist: value})}
                searchPlaceholder="Search therapists..."
              />
              </>
            )}

            <Select 
              value={newVisit.sellable} 
              onValueChange={(value) => setNewVisit({...newVisit, sellable: value})}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Product / Service" />
              </SelectTrigger>
              <SelectContent>
                {sellables.map(sellable => (
                  <SelectItem key={sellable.id} value={sellable.id}>
                    {sellable.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex flex-col space-y-2">
              <div className="flex space-x-2">
                <div className="flex-grow">
                  <Label htmlFor="date">{isRescheduling ? ("Reschedule To") : ("Starts On")}</Label>
                  <DatePicker
                    id="date"
                    selected={newVisit.date}
                    value={newVisit.date}
                    onChange={(date) => {setNewVisit({...newVisit, date: date}); console.log(date)}}
                    dateFormat="dd/MM/yyyy"
                  />
                </div>
                <div>
                  <Label htmlFor="time">Time</Label>
                  {/* <TimeSelect
                    id="time"
                    value={newVisit.time}
                    onChange={(time) => {setNewVisit({...newVisit, time: time}); console.log(newVisit.time)}}
                  /> */}
                  <ClockPicker
                    id="time"
                    value={newVisit.time}
                    onChange={(time) => {setNewVisit({...newVisit, time: time}); console.log(newVisit.time)}}
                  />
                </div>
              </div>
            </div>
            {isRescheduling ? (
              <>

              </>
            ) : (
              <>
                <Select onValueChange={(value) => setNewVisit({...newVisit, frequency: value})}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="does_not_repeat">Does not repeat</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>

                {newVisit.frequency === 'weekly' && (
                  <>
                    <div>
                      <Label className="mb-2 block">Select Weekdays</Label>
                      <div className="flex flex-wrap gap-2">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                          <Button
                            key={day}
                            variant={newVisit.weekdays.includes(day) ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              const updatedWeekdays = newVisit.weekdays.includes(day)
                                ? newVisit.weekdays.filter(d => d !== day)
                                : [...newVisit.weekdays, day];
                              setNewVisit({...newVisit, weekdays: updatedWeekdays});
                            }}
                          >
                            {day}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Ends On (DD/MM/YYYY)</Label>
                      <DatePicker
                        id="enddate"
                        selected={date}
                        onChange={(date) => setNewVisit({...newVisit, endsOn: date ? date.toISOString().split('T')[0] : ''})}
                        dateFormat="dd/MM/yyyy"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sessions">OR</Label>
                      <Input
                        id="sessions"
                        type="number"
                        placeholder="For next 'X' sessions"
                        value={newVisit.sessions}
                        onChange={(e) => setNewVisit({...newVisit, sessions: e.target.value})}
                      />
                    </div>
                  </>
                )}

              </>
            )}
            
            <div className="space-y-2">
              <Label>Duration</Label>
              <RadioGroup onValueChange={(value) => setNewVisit({...newVisit, duration: parseInt(value), customDuration: ''})}>
                <div className="flex flex-wrap gap-2">
                  {[30, 45, 60, 90].map((duration) => (
                    <div key={duration} className="flex items-center space-x-2">
                      <RadioGroupItem value={duration.toString()} id={`duration-${duration}`} />
                      <Label htmlFor={`duration-${duration}`}>{duration} Mins</Label>
                    </div>
                  ))}
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id="duration-custom" />
                    <Label htmlFor="duration-custom">Custom</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {newVisit.duration === 0 && (
              <Input
                type="number"
                placeholder="Custom Duration in mins"
                value={newVisit.customDuration}
                onChange={(e) => setNewVisit({...newVisit, customDuration: e.target.value})}
              />
            )}
          </div>
          <Button onClick={isRescheduling ? submitReschedule : addVisit} className="w-full">
            {isRescheduling ? 'Reschedule Appointment' : 'Book Appointment'}
          </Button>
        </DialogContent>
      </Dialog>
    </Card>
  );
}