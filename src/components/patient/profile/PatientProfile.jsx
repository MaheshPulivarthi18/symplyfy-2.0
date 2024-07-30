// PatientProfile.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Check } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/datepicker';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { parseISO, format, addMinutes, addHours } from 'date-fns';
import { CalendarIcon, Clock } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { date } from 'zod';
import { MoreVertical, FileText, Phone, Mail, Edit } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const PatientProfile = () => {
  const { clinic_id, patient_id } = useParams();
  const { toast } = useToast();
  const { authenticatedFetch } = useAuth();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState([]);
  const [goals, setGoals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [sellables, setSellables] = useState([]);
  const [employeeDetails, setEmployeeDetails] = useState({});
  const [sellableDetails, setSellableDetails] = useState({});
  
  const [progress, setProgress] = useState(0);
  const [newNote, setNewNote] = useState({ description: '', visible_to_patient: false });
  const [newGoal, setNewGoal] = useState({ title: '', description: '', complete_by: '' });
  const [newTask, setNewTask] = useState({ name: '', description: '', repetitions: 0, goal: '' });
  const [newAppointment, setNewAppointment] = useState({
    date: '',
    time: '09:00',
    employee: '',
    sellable: '',
    duration: 30,
    frequency: 'does_not_repeat',
    weekdays: [],
    endsOn: '',
    sessions: '',
  });

  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false);
  const [openNoteDialogs, setOpenNoteDialogs] = useState({});
  const [openGoalDialogs, setOpenGoalDialogs] = useState({});

  const [visits, setVisits] = useState([]);
  const [isVisitDialogOpen, setIsVisitDialogOpen] = useState(false);
  const [newVisit, setNewVisit] = useState({
    date: '',
    time: '',
    comment: '',
    employee: '',
    sellable: '',
    sellable_reduce_balance: false,
    walk_in: false,
    penalty: false,
    duration: ''
  });

  const [payments, setPayments] = useState([]);
  const [paymentChannels, setPaymentChannels] = useState([]);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [newPayment, setNewPayment] = useState({
    amount_paid: '',
    amount_refunded: '0',
    date: new Date().toISOString().split('T')[0],
    channel: ''
  });

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
      }, 70);
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

  const fetchPatientData = async () => {
    setLoading(true);
    try {
      const data = await fetchWithTokenHandling(`${import.meta.env.VITE_BASE_URL}/api/emp/clinic/${clinic_id}/patient/${patient_id}/`);
      setPatient(data);
      setFormData(data);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchNotes = async () => {
    try {
      const data = await fetchWithTokenHandling(`${import.meta.env.VITE_BASE_URL}/api/emp/clinic/${clinic_id}/patient/${patient_id}/note/`);
      setNotes(data);
    } catch (error) {
      console.error("Failed to fetch notes:", error);
      setNotes([]);
    }
  };

  const fetchGoals = async () => {
    try {
      const data = await fetchWithTokenHandling(`${import.meta.env.VITE_BASE_URL}/api/emp/clinic/${clinic_id}/patient/${patient_id}/goal/`);
      setGoals(data);
    } catch (error) {
      console.error("Failed to fetch goals:", error);
      setGoals([]);
    }
  };

  const fetchNoteDetails = async (noteId) => {
    try {
      const data = await fetchWithTokenHandling(`${import.meta.env.VITE_BASE_URL}/api/emp/clinic/${clinic_id}/patient/${patient_id}/note/${noteId}/`);
      setSelectedNote(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch note details.",
        variant: "destructive",
      });
    }
  };

  const fetchGoalDetails = async (goalId) => {
    try {
      const data = await fetchWithTokenHandling(`${import.meta.env.VITE_BASE_URL}/api/emp/clinic/${clinic_id}/patient/${patient_id}/goal/${goalId}/`);
      setSelectedGoal(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch goal details.",
        variant: "destructive",
      });
    }
  };

  const fetchPayments = async () => {
    try {
      const data = await fetchWithTokenHandling(`${import.meta.env.VITE_BASE_URL}/api/emp/clinic/${clinic_id}/patient/${patient_id}/payment/`);
      setPayments(data);
    } catch (error) {
      console.error("Failed to fetch payments:", error);
      setPayments([]);
    }
  };
  
  const fetchPaymentChannels = async () => {
    try {
      const data = await fetchWithTokenHandling(`${import.meta.env.VITE_BASE_URL}/api/emp/clinic/${clinic_id}/payment/channel/`);
      setPaymentChannels(data);
    } catch (error) {
      console.error("Failed to fetch payment channels:", error);
      setPaymentChannels([]);
    }
  };

  const updateNote = async (noteId, updatedData) => {
    try {
      const data = await fetchWithTokenHandling(`${import.meta.env.VITE_BASE_URL}/api/emp/clinic/${clinic_id}/patient/${patient_id}/note/${noteId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
      setSelectedNote(data);
      fetchNotes(); // Refresh the notes list
      toast({ title: "Success", description: "Note updated successfully" });
      setOpenNoteDialogs(prev => ({ ...prev, [noteId]: false })); // Close the specific dialog
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const updateGoal = async (goalId, updatedData) => {
    try {
      const data = await fetchWithTokenHandling(`${import.meta.env.VITE_BASE_URL}/api/emp/clinic/${clinic_id}/patient/${patient_id}/goal/${goalId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
      setSelectedGoal(data);
      fetchGoals(); // Refresh the goals list
      toast({ title: "Success", description: "Goal updated successfully" });
      setOpenGoalDialogs(prev => ({ ...prev, [goalId]: false })); // Close the specific dialog
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  
  const fetchBookings = async () => {
    try {
      const data = await fetchWithTokenHandling(`${import.meta.env.VITE_BASE_URL}/api/emp/clinic/${clinic_id}/patient/${patient_id}/booking/`);
      setAppointments(data);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      setAppointments([]);
    }
  };

  const fetchSellables = async () => {
    try {
      const data = await fetchWithTokenHandling(`${import.meta.env.VITE_BASE_URL}/api/emp/clinic/${clinic_id}/sellable/`);
      setSellables(data);
    } catch (error) {
      console.error("Failed to fetch sellables:", error);
      setSellables([]);
    }
  };

  const addNote = async () => {
    try {
      const response = await fetchWithTokenHandling(`${import.meta.env.VITE_BASE_URL}/api/emp/clinic/${clinic_id}/patient/${patient_id}/note/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newNote),
      });
      setNotes([...notes, response]);
      setNewNote({ description: '', visible_to_patient: false });
      toast({ title: "Success", description: "Note added successfully" });
      setIsNoteDialogOpen(false); // Close the dialog
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const addGoal = async () => {
    try {
      const response = await fetchWithTokenHandling(`${import.meta.env.VITE_BASE_URL}/api/emp/clinic/${clinic_id}/patient/${patient_id}/goal/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newGoal),
      });
      setGoals([...goals, response]);
      setNewGoal({ title: '', description: '', complete_by: '' });
      toast({ title: "Success", description: "Goal added successfully" });
      setIsGoalDialogOpen(false); // Close the dialog
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const addTask = async () => {
    try {
      const response = await fetchWithTokenHandling(`${import.meta.env.VITE_BASE_URL}/api/emp/clinic/${clinic_id}/patient/${patient_id}/task/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTask),
      });
      setTasks([...tasks, response]);
      setNewTask({ name: '', description: '', repetitions: 0, goal: '' });
      toast({ title: "Success", description: "Task added successfully" });
      fetchTasks();
      setIsTaskDialogOpen(false); // Close the dialog
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const fetchTasks = async () => {
    try {
      const data = await fetchWithTokenHandling(`${import.meta.env.VITE_BASE_URL}/api/emp/clinic/${clinic_id}/patient/${patient_id}/task/`);
      setTasks(data);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      setTasks([]);
    }
  };

  const fetchVisits = async () => {
    try {
      const data = await fetchWithTokenHandling(`${import.meta.env.VITE_BASE_URL}/api/emp/clinic/${clinic_id}/patient/${patient_id}/visit/`);
      setVisits(data);
  
      const employeeIds = new Set();
      const sellableIds = new Set();
  
      data.forEach(visit => {
        if (visit.employee) {
          employeeIds.add(visit.employee);
        }
        if (visit.sellable) {
          sellableIds.add(visit.sellable);
        }
      });
  
      const fetchEmployeePromises = Array.from(employeeIds).map(id => fetchEmployeeDetails(id));
      const fetchSellablePromises = Array.from(sellableIds).map(id => fetchSellableDetails(id));
  
      await Promise.all([...fetchEmployeePromises, ...fetchSellablePromises]);
  
      console.log(employeeIds);
      console.log(sellableIds);
  
    } catch (error) {
      console.error("Failed to fetch visits:", error);
      setVisits([]);
    }
  };

  const completeTask = async (taskId) => {
    try {
      await fetchWithTokenHandling(`${import.meta.env.VITE_BASE_URL}/api/pat/clinic/${clinic_id}/patient/me/task/${taskId}/complete/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ task: taskId }),
      });
      fetchTasks(); // Refresh the tasks list
      toast({ title: "Success", description: "Task marked as completed" });
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const fetchTherapists = async () => {
    try {
      const data = await fetchWithTokenHandling(`${import.meta.env.VITE_BASE_URL}/api/emp/clinic/${clinic_id}/employee/`);
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

  const createBooking = async (bookingData) => {
    try {
      const response = await fetchWithTokenHandling(`${import.meta.env.VITE_BASE_URL}/api/emp/clinic/${clinic_id}/schedule/booking/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      return response;
    } catch (error) {
      throw new Error(`Error creating booking: ${error.message}`);
    }
  };

  const fetchAppointments = async () => {
    try {
      const data = await fetchWithTokenHandling(`${import.meta.env.VITE_BASE_URL}/api/emp/clinic/${clinic_id}/patient/${patient_id}/booking/`);
      setAppointments(data);
      
      const employeeIds = new Set();
      const sellableIds = new Set();
  
      data.forEach(appointment => {
        if (appointment.employee?.id) {
          employeeIds.add(appointment.employee.id);
        }
        if (appointment.sellable) {
          sellableIds.add(appointment.sellable);
        }
      });
  
      const fetchEmployeePromises = Array.from(employeeIds).map(id => fetchEmployeeDetails(id));
      const fetchSellablePromises = Array.from(sellableIds).map(id => fetchSellableDetails(id));
      
      await Promise.all([...fetchEmployeePromises, ...fetchSellablePromises]);
      
      console.log(employeeIds);
      console.log(sellableIds);
  
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
      setAppointments([]);
    }
  };
  
  const handleAddAppointment = async (e) => {
    e.preventDefault();
    try {
      console.log("New Appointment Data:", newAppointment);
  
      // Ensure newAppointment.time is a valid time string
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (!timeRegex.test(newAppointment.time)) {
        console.log("Time regex test failed");
        throw new Error("Invalid time format");
      }
  
      // Ensure newAppointment.date is a valid date string
      if (!newAppointment.date || isNaN(new Date(newAppointment.date).getTime())) {
        console.log("Invalid date");
        throw new Error("Invalid date");
      }
  
      // Create a Date object in the local time zone
      const [year, month, day] = newAppointment.date.split('-');
      const [hours, minutes] = newAppointment.time.split(':');
      const localDate = new Date(year, month - 1, day, hours, minutes);
      console.log("Local Date:", localDate);
  
      if (isNaN(localDate.getTime())) {
        console.log("Invalid Date object created");
        throw new Error("Invalid Date object created");
      }
  
      // Convert to UTC
      const utcDate = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000);
      console.log("UTC Date:", utcDate);
      
      // Convert UTC to Indian Standard Time (IST)
      const istDate = new Date(utcDate.getTime() - (5.5 * 60 * 60 * 1000));
      console.log("IST Date:", istDate);
  
      const startDateTime = istDate;
      const endDateTime = new Date(startDateTime.getTime() + newAppointment.duration * 60000);
      
      console.log("Start Date Time:", startDateTime);
      console.log("End Date Time:", endDateTime);
      
      let recurrenceRule = null;
      if (newAppointment.frequency === 'weekly') {
        recurrenceRule = `RRULE:FREQ=WEEKLY;BYDAY=${formattedWeekdays}`;
        if (newAppointment.endsOn) {
          const endDate = addMinutes(parseISO(newAppointment.endsOn), -indianTimeZoneOffset);
          recurrenceRule += `;UNTIL=${format(endDate, "yyyyMMdd'T'HHmmss'Z'")}`;
        } else if (newAppointment.sessions) {
          recurrenceRule += `;COUNT=${newAppointment.sessions}`;
        }
      }

      console.log("Start Date Time:", startDateTime);
      console.log("End Date Time:", endDateTime);
  
      const bookingData = {
        start: startDateTime.toISOString(),
        end: endDateTime.toISOString(),
        patient: patient.id,
        employee: newAppointment.employee,
        sellable: newAppointment.sellable,
        recurrence: recurrenceRule,
      };
  
      console.log("Booking Data:", bookingData);

      const response = await createBooking(bookingData);
      console.log(response)
      setAppointments([...appointments, response]);
      setNewAppointment({
        date: '',
        time: '',
        employee: '',
        sellable: '',
        duration: 30,
        frequency: 'does_not_repeat',
        weekdays: [],
        endsOn: '',
        sessions: '',
      });
      setIsAppointmentDialogOpen(false);
      toast({ title: "Success", description: "Appointment booked successfully" });
    } catch (error) {
      console.log(error.message, "ERROR MESSAGE AT HANDLEADDAPPOINTMENT");
      console.log("Error stack:", error.stack);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleAddVisit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetchWithTokenHandling(`${import.meta.env.VITE_BASE_URL}/api/emp/clinic/${clinic_id}/patient/${patient_id}/visit/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newVisit),
      });
      setVisits(prevVisits => [...prevVisits, response]);
      
      // Fetch details for the new visit
      if (response.employee) fetchEmployeeDetails(response.employee);
      if (response.sellable) fetchSellableDetails(response.sellable);
  
      setNewVisit({
        date: '',
        time: '',
        comment: '',
        employee: '',
        sellable: '',
        sellable_reduce_balance: false,
        walk_in: false,
        penalty: false,
        duration: ''
      });
      setIsVisitDialogOpen(false);
      toast({ title: "Success", description: "Visit added successfully" });
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const fetchEmployeeDetails = async (employeeId) => {
    try {
      const data = await fetchWithTokenHandling(`${import.meta.env.VITE_BASE_URL}/api/emp/clinic/${clinic_id}/employee/${employeeId}/`);
      setEmployeeDetails(prevDetails => ({
        ...prevDetails,
        [employeeId]: data
      }));
    } catch (error) {
      console.error("Failed to fetch employee details:", error);
    }
  };
  
  const fetchSellableDetails = async (sellableId) => {
    try {
      const data = await fetchWithTokenHandling(`${import.meta.env.VITE_BASE_URL}/api/emp/clinic/${clinic_id}/sellable/${sellableId}/`);
      setSellableDetails(prevDetails => ({
        ...prevDetails,
        [sellableId]: data
      }));
    } catch (error) {
      console.error("Failed to fetch sellable details:", error);
    }
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    try {
      const response = await fetchWithTokenHandling(`${import.meta.env.VITE_BASE_URL}/api/emp/clinic/${clinic_id}/patient/${patient_id}/payment/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPayment),
      });
      setPayments([...payments, response]);
      setNewPayment({
        amount_paid: '',
        amount_refunded: '0',
        date: new Date().toISOString().split('T')[0],
        channel: ''
      });
      setIsPaymentDialogOpen(false);
      toast({ title: "Success", description: "Payment added successfully" });
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };


  useEffect(() => {
    fetchPatientData();
    fetchNotes();
    fetchGoals();
    fetchTasks();
    fetchAppointments();
    fetchTherapists();
    fetchSellables();
    fetchPayments();
    fetchPaymentChannels();
    fetchVisits();
  }, [clinic_id, patient_id]);



  useEffect(() => {
    fetchPatientData();
    fetchNotes();
    fetchGoals();
    fetchTasks();
    fetchBookings();
    fetchTherapists();
    fetchSellables();
  }, [clinic_id, patient_id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedPatient = await fetchWithTokenHandling(`${import.meta.env.VITE_BASE_URL}/api/emp/clinic/${clinic_id}/patient/${patient_id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      setPatient(updatedPatient);
      setIsEditing(false);
      toast({ title: "Success", description: "Patient information updated successfully" });
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [selectedSellable, setSelectedSellable] = useState('');
  const [finalAmount, setFinalAmount] = useState(0);

  const handleAddInvoiceItem = () => {
    const sellable = sellables.find(s => s.id === selectedSellable);
    console.log(sellable)
    if (sellable) {
      setInvoiceItems([...invoiceItems, {
        sellable: sellable.id,
        name: sellable.name,
        quantity: 1,
        rate: sellable.rate,
        gross: sellable.rate,
        discount: 0,
        net: sellable.rate,
        tax: 0,
        add_balance: true
      }]);
      setFinalAmount(prevAmount => parseInt(prevAmount) + parseInt(sellable.rate));
    }
  };

  const handleGenerateInvoice = async () => {
    try {
      const response = await fetchWithTokenHandling(`${import.meta.env.VITE_BASE_URL}/api/emp/clinic/${clinic_id}/patient/${patient_id}/invoice/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: new Date().toISOString().split('T')[0],
          status: 'd',
          gross_amount: finalAmount.toString(),
          final_amount: finalAmount.toString(),
          items: invoiceItems
        }),
      });
      toast({ title: "Success", description: "Invoice generated successfully" });
      setIsInvoiceDialogOpen(false);
      setInvoiceItems([]);
      setFinalAmount(0);
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
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
  if (!patient) return <div>Patient not found</div>;

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
      <Select value={value} onValueChange={(newTime) => onChange(newTime)}>
        <SelectTrigger>
          <SelectValue placeholder="Select time" />
        </SelectTrigger>
        <SelectContent>
          {generateTimeOptions()}
        </SelectContent>
      </Select>
    );
  };

  return (
    <div className="flex w-full gap-8 p-8 container mx-auto shadow-xl">
      <Card className="w-[45%]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Patient Information</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsInvoiceDialogOpen(true)}>
                <FileText className="mr-2 h-4 w-4" />
                <span>Generate Invoice</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsVisitDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                <span>Mark New Visit</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit Patient Details</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => window.location.href = `tel:${patient.mobile}`}>
                <Phone className="mr-2 h-4 w-4" />
                <span>Call {patient.mobile}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.location.href = `mailto:${patient.email}`}>
                <Mail className="mr-2 h-4 w-4" />
                <span>Email {patient.email}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${formData.first_name} ${formData.last_name}`} />
                <AvatarFallback>{formData.first_name[0]}{formData.last_name[0]}</AvatarFallback>
              </Avatar>
              <div className="w-full space-y-4">
                {/* Add form fields for all patient properties */}
                <div>
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="mobile">Last Name</Label>
                  <Input
                    id="mobile"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
                {/* Add more fields for email, mobile, sex, dob, etc. */}
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
                <Link to={`/clinic/${clinic_id}/patients/${patient_id}/schedule`}>
                  <Button variant="outline">View Schedule</Button>
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
        <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Generate Invoice</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="gap-4">
                <Label htmlFor="sellable" className="text-right">
                  Product/Service
                </Label>
                <Select 
                  onValueChange={setSelectedSellable} 
                  value={selectedSellable}
                  className="col-span-3"
                >
                  <SelectTrigger id="sellable">
                    <SelectValue placeholder="Select product/service" />
                  </SelectTrigger>
                  <SelectContent>
                    {sellables.map(sellable => (
                      <SelectItem key={sellable.id} value={sellable.id}>
                        {sellable.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddInvoiceItem}>+ Add Item</Button>
              <div className="border p-2">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th>Product/Service</th>
                      <th>Quantity</th>
                      <th>Rate</th>
                      <th>Discount</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceItems.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center">No items added</td>
                      </tr>
                    ) : (
                      invoiceItems.map((item, index) => (
                        <tr key={index}>
                          <td>{item.name}</td>
                          <td>{item.quantity}</td>
                          <td>{item.rate}</td>
                          <td>{item.discount}</td>
                          <td>{item.net}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="finalAmount" className="text-right">
                  Final Amount
                </Label>
                <Input 
                  id="finalAmount" 
                  value={finalAmount} 
                  onChange={(e) => setFinalAmount(parseFloat(e.target.value))} 
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleGenerateInvoice}>Generate Invoice</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      <div className="w-full space-y-8">
        <Tabs className='w-full' defaultValue="notes">
          <TabsList className='w-full justify-around'>
            <TabsTrigger className='px-12' value="notes">Notes</TabsTrigger>
            <TabsTrigger className='px-12' value="goals">Goals</TabsTrigger>
            <TabsTrigger className='px-12' value="appointments">Appointments</TabsTrigger>
            <TabsTrigger className='px-12' value="visits">Visits</TabsTrigger>
            <TabsTrigger className='px-12' value="payments">Payments</TabsTrigger>
            <TabsTrigger className='px-12' value="tasks">Tasks</TabsTrigger>
          </TabsList>
          <TabsContent value="notes" className="relative min-h-[300px] p-4 pb-16">
            {notes.length === 0 ? (
              <p>No notes available for this patient.</p>
            ) : (
              notes.map(note => (
                <Dialog 
                    key={note.id} 
                    open={openNoteDialogs[note.id]} 
                    onOpenChange={(open) => setOpenNoteDialogs(prev => ({ ...prev, [note.id]: open }))}
                  >
                  <DialogTrigger asChild>
                    <div 
                        className="p-2 bg-gray-100 rounded mb-2 cursor-pointer" 
                        onClick={() => {
                          fetchNoteDetails(note.id);
                          setOpenNoteDialogs(prev => ({ ...prev, [note.id]: true }));
                        }}
                      >
                      <p>{note.description}</p>
                      <small>{new Date(note.created_on).toLocaleString()}</small>
                    </div>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Note Details</DialogTitle>
                    </DialogHeader>
                    {selectedNote && (
                      <>
                        <Textarea 
                          value={selectedNote.description}
                          onChange={(e) => setSelectedNote({...selectedNote, description: e.target.value})}
                        />
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="visible-to-patient"
                            checked={selectedNote.visible_to_patient}
                            onCheckedChange={(checked) => setSelectedNote({...selectedNote, visible_to_patient: checked})}
                          />
                          <Label htmlFor="visible-to-patient">Visible to patient</Label>
                        </div>
                        <Button onClick={() => updateNote(selectedNote.id, {
                          description: selectedNote.description,
                          visible_to_patient: selectedNote.visible_to_patient
                        })}>Update Note</Button>
                      </>
                    )}
                  </DialogContent>
                </Dialog>
              ))
            )}
            <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
              <DialogTrigger asChild>
                <Button className="absolute bottom-0 right-0">
                <PlusCircle className="h-4 w-4" /></Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Note</DialogTitle>
                </DialogHeader>
                <Textarea 
                  value={newNote.description}
                  onChange={(e) => setNewNote({...newNote, description: e.target.value})}
                  placeholder="Enter note..."
                />
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="visible-to-patient"
                    checked={newNote.visible_to_patient}
                    onCheckedChange={(checked) => setNewNote({...newNote, visible_to_patient: checked})}
                  />
                  <Label htmlFor="visible-to-patient">Visible to patient</Label>
                </div>
                <Button onClick={addNote}>Save Note</Button>
              </DialogContent>
            </Dialog>
          </TabsContent>
          <TabsContent value="goals" className="relative min-h-[300px] p-4 pb-16">
          {goals.length === 0 ? (
                <p>No goals set for this patient.</p>
              ) : (
                goals.map(goal => (
                  <Dialog 
                    key={goal.id} 
                    open={openGoalDialogs[goal.id]} 
                    onOpenChange={(open) => setOpenGoalDialogs(prev => ({ ...prev, [goal.id]: open }))}
                  >
                    <DialogTrigger asChild>
                      <div 
                          className="p-2 bg-gray-100 rounded mb-2 cursor-pointer" 
                          onClick={() => {
                            fetchGoalDetails(goal.id);
                            setOpenGoalDialogs(prev => ({ ...prev, [goal.id]: true }));
                          }}
                        >
                        <h3>{goal.title}</h3>
                        <p>{goal.description}</p>
                        <small>Complete by: {goal.complete_by}</small>
                      </div>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Goal Details</DialogTitle>
                      </DialogHeader>
                      {selectedGoal && (
                        <>
                          <Input 
                            value={selectedGoal.title}
                            onChange={(e) => setSelectedGoal({...selectedGoal, title: e.target.value})}
                            placeholder="Goal title"
                          />
                          <Textarea 
                            value={selectedGoal.description}
                            onChange={(e) => setSelectedGoal({...selectedGoal, description: e.target.value})}
                            placeholder="Goal description"
                          />
                          <DatePicker
                            selected={selectedGoal.complete_by ? new Date(selectedGoal.complete_by) : null}
                            onChange={(date) => setSelectedGoal({...selectedGoal, complete_by: date.toISOString().split('T')[0]})}
                            placeholderText="Complete by"
                          />
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="is-completed"
                              checked={selectedGoal.is_completed}
                              onCheckedChange={(checked) => setSelectedGoal({...selectedGoal, is_completed: checked})}
                            />
                            <Label htmlFor="is-completed">Is completed</Label>
                          </div>
                          <Button onClick={() => updateGoal(selectedGoal.id, {
                            title: selectedGoal.title,
                            description: selectedGoal.description,
                            complete_by: selectedGoal.complete_by,
                            is_completed: selectedGoal.is_completed
                          })}>Update Goal</Button>
                        </>
                      )}
                    </DialogContent>
                  </Dialog>
                ))
              )}
            <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
              <DialogTrigger asChild>
                <Button className="absolute bottom-0 right-0">
                <PlusCircle className="h-4 w-4" /></Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Goal</DialogTitle>
                </DialogHeader>
                <Input 
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                  placeholder="Goal title"
                />
                <Textarea 
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                  placeholder="Goal description"
                />
                <DatePicker
                  selected={newGoal.complete_by ? new Date(newGoal.complete_by) : null}
                  onChange={(date) => setNewGoal({...newGoal, complete_by: date.toISOString().split('T')[0]})}
                  placeholderText="Complete by"
                />
                <Button onClick={addGoal}>Save Goal</Button>
              </DialogContent>
            </Dialog>
          </TabsContent>
          <TabsContent value="tasks" className="relative min-h-[300px] p-4 pb-16">
            {tasks.length === 0 ? (
                <p>No tasks assigned to this patient.</p>
              ) : (
                tasks.map(task => (
                  <div key={task.id} className="p-2 bg-gray-100 rounded mb-2 flex justify-between items-center">
                    <div>
                      <h3>{task.name}</h3>
                      <p>{task.description}</p>
                      <p>Repetitions: {task.repetitions}</p>
                      <p>Completed this week: {task.completed_this_week}</p>
                    </div>
                    <Button
                      onClick={() => completeTask(task.id)}
                      disabled={task.completed_this_week >= task.repetitions}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Complete
                    </Button>
                  </div>
                ))
              )}
            <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
              <DialogTrigger asChild>
                <Button className="absolute bottom-0 right-0"><PlusCircle className="h-4 w-4" /></Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Task</DialogTitle>
                </DialogHeader>
                <Input 
                  value={newTask.name}
                  onChange={(e) => setNewTask({...newTask, name: e.target.value})}
                  placeholder="Task name"
                />
                <Textarea 
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  placeholder="Task description"
                />
                <Input 
                  type="number"
                  value={newTask.repetitions}
                  onChange={(e) => setNewTask({...newTask, repetitions: parseInt(e.target.value)})}
                  placeholder="Repetitions"
                />
                <Select onValueChange={(value) => setNewTask({...newTask, goal: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a goal" />
                  </SelectTrigger>
                  <SelectContent>
                    {goals.map(goal => (
                      <SelectItem key={goal.id} value={goal.id}>{goal.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={addTask}>Save Task</Button>
              </DialogContent>
            </Dialog>
          </TabsContent>
          
          {/* Appointment TabsContent */}
          <TabsContent value="appointments" className="relative min-h-[300px] max-h-[600px] p-4 pb-16 overflow-scroll">
            {appointments.length === 0 ? (
              <p>No upcoming appointments for this patient.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='text-center'>Therapist</TableHead>
                    <TableHead className='text-center'>Date</TableHead>
                    <TableHead className='text-center'>Start Time</TableHead>
                    <TableHead className='text-center'>End Time</TableHead>
                    <TableHead className='text-center'>Service</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map(appointment => (
                    <TableRow key={appointment.id}>
                      <TableCell>{employeeDetails[appointment.employee] ? employeeDetails[appointment.employee].first_name + " " + employeeDetails[appointment.employee].last_name  : appointment.employee.first_name+ " " +appointment.employee.last_name}</TableCell>
                      <TableCell>{format(parseISO(appointment.start), 'yyyy-MM-dd')}</TableCell>
                      <TableCell>{format(parseISO(appointment.start), 'HH:mm')}</TableCell>
                      <TableCell>{format(parseISO(appointment.end), 'HH:mm')}</TableCell>
                      <TableCell>
                        {sellableDetails[appointment.sellable]
                          ? sellableDetails[appointment.sellable].name
                          : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <Dialog open={isAppointmentDialogOpen} onOpenChange={setIsAppointmentDialogOpen}>
              <DialogTrigger asChild>
                <Button className='sticky bottom-0 right-0 flex self-end ml-auto mt-4' >
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add Appointment</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddAppointment}>
                  <div className="grid gap-4 py-4">
                    <Select onValueChange={(value) => setNewAppointment({...newAppointment, employee: value})}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Therapist" />
                      </SelectTrigger>
                      <SelectContent>
                        {therapists.map(therapist => (
                          <SelectItem key={therapist.id} value={therapist.id}>
                            {therapist.first_name} {therapist.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select onValueChange={(value) => setNewAppointment({...newAppointment, sellable: value})}>
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
                          <Label htmlFor="date">Starts On (DD/MM/YYYY)</Label>
                          <DatePicker
                            id="date"
                            selected={newAppointment.date ? new Date(newAppointment.date) : null}
                            onChange={(date) => setNewAppointment({...newAppointment, date: date.toISOString().split('T')[0]})}
                            dateFormat="dd/MM/yyyy"
                          />
                          {/* 
                          <DatePicker
                            id="enddate"
                            selected={date}
                            onChange={(date) => setNewVisit({...newVisit, endsOn: date ? date.toISOString().split('T')[0] : ''})}
                            dateFormat="dd/MM/yyyy"
                          /> */}
                        </div>
                        <div>
                          <Label htmlFor="time">Time</Label>
                          <TimeSelect
                            id="time"
                            value={newAppointment.time}
                            onChange={(time) => setNewAppointment({...newAppointment, time: time})}
                          />
                        </div>
                      </div>
                    </div>

                    <Select onValueChange={(value) => setNewAppointment({...newAppointment, frequency: value})}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="does_not_repeat">Does not repeat</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>

                    {newAppointment.frequency === 'weekly' && (
                      <>
                        <div>
                          <Label className="mb-2 block">Select Weekdays</Label>
                          <div className="flex flex-wrap gap-2">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                              <Button
                                key={day}
                                variant={newAppointment.weekdays.includes(day) ? "default" : "outline"}
                                size="sm"
                                onClick={() => {
                                  const updatedWeekdays = newAppointment.weekdays.includes(day)
                                    ? newAppointment.weekdays.filter(d => d !== day)
                                    : [...newAppointment.weekdays, day];
                                  setNewAppointment({...newAppointment, weekdays: updatedWeekdays});
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
                            onChange={(date) => setNewAppointment({...newAppointment, endsOn: date ? date.toISOString().split('T')[0] : ''})}
                            dateFormat="dd/MM/yyyy"
                          /> 
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="sessions">OR</Label>
                          <Input
                            id="sessions"
                            type="number"
                            placeholder="For next 'X' sessions"
                            value={newAppointment.sessions}
                            onChange={(e) => setNewAppointment({...newAppointment, sessions: e.target.value})}
                          />
                        </div>
                      </>
                    )}

                    <div className="space-y-2">
                      <Label>Duration</Label>
                      <RadioGroup onValueChange={(value) => setNewAppointment({...newAppointment, duration: parseInt(value)})}>
                        <div className="flex flex-wrap gap-2">
                          {[30, 45, 60, 90].map((duration) => (
                            <div key={duration} className="flex items-center space-x-2">
                              <RadioGroupItem value={duration.toString()} id={`duration-${duration}`} />
                              <Label htmlFor={`duration-${duration}`}>{duration} Mins</Label>
                            </div>
                          ))}
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="custom" id="duration-custom" />
                            <Label htmlFor="duration-custom">Custom</Label>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>

                    {newAppointment.duration === 'custom' && (
                      <Input
                        type="number"
                        placeholder="Custom Duration in mins"
                        value={newAppointment.duration}
                        onChange={(e) => setNewAppointment({...newAppointment, duration: parseInt(e.target.value)})}
                      />
                    )}
                  </div>
                  <Button type="submit" className="w-full">Book Appointment</Button>
                </form>
              </DialogContent>
            </Dialog>
          </TabsContent>
          
          <TabsContent value="payments" className="relative min-h-[300px] p-4 pb-16">
            {payments.length === 0 ? (
              <p>No payments recorded for this patient.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount Paid</TableHead>
                    <TableHead>Amount Refunded</TableHead>
                    <TableHead>Channel</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map(payment => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.date}</TableCell>
                      <TableCell>{payment.amount_paid}</TableCell>
                      <TableCell>{payment.amount_refunded}</TableCell>
                      <TableCell>{paymentChannels.find(ch => ch.id === payment.channel)?.name || 'Unknown'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
              <DialogTrigger asChild>
                <Button className="absolute bottom-0 right-0">
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Payment</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddPayment}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="amount_paid">Amount Paid</Label>
                      <Input
                        id="amount_paid"
                        type="number"
                        value={newPayment.amount_paid}
                        onChange={(e) => setNewPayment({...newPayment, amount_paid: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="date">Payment Date</Label>
                      <DatePicker
                        id="date"
                        selected={newPayment.date}
                        onChange={(date) => setNewPayment({...newPayment, date: date.toISOString().split('T')[0]})}
                        required
                      />
                      {/* 
                      <DatePicker
                        id="date"
                        selected={newVisit.date ? new Date(newVisit.date) : null}
                        dateFormat="dd/MM/yyyy"
                        onChange={(date) => setNewVisit({...newVisit, date: date.toISOString().split('T')[0]})}
                       /> */}
                    </div>
                    <div>
                      <Label htmlFor="channel">Payment Channel</Label>
                      <Select onValueChange={(value) => setNewPayment({...newPayment, channel: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment channel" />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentChannels.map(channel => (
                            <SelectItem key={channel.id} value={channel.id}>
                              {channel.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="mt-4">Add Payment</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="visits" className="relative min-h-[300px] p-4 pb-16">
            {visits.length === 0 ? (
              <p>No visits recorded for this patient.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Walk-in</TableHead>
                    <TableHead>Penalty</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visits.map(visit => (
                    <TableRow key={visit.id}>
                      <TableCell>{visit.date}</TableCell>
                      <TableCell>{visit.time || 'N/A'}</TableCell>
                      <TableCell>
                        {employeeDetails[visit.employee] 
                          ? `${employeeDetails[visit.employee].first_name} ${employeeDetails[visit.employee].last_name}`
                          : 'Loading...'}
                      </TableCell>
                      <TableCell>
                        {sellableDetails[visit.sellable]
                          ? sellableDetails[visit.sellable].name
                          : 'Loading...'}
                      </TableCell>
                      <TableCell>{visit.walk_in ? 'Yes' : 'No'}</TableCell>
                      <TableCell>{visit.penalty ? 'Yes' : 'No'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <Dialog open={isVisitDialogOpen} onOpenChange={setIsVisitDialogOpen}>
              <DialogTrigger asChild>
                <Button className="absolute bottom-0 right-0">
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Visit</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddVisit}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="date">Visit Date</Label>
                      <DatePicker
                        id="date"
                        selected={newVisit.date ? new Date(newVisit.date) : null}
                        dateFormat="dd/MM/yyyy"
                        onChange={(date) => setNewVisit({...newVisit, date: date.toISOString().split('T')[0]})}
                        />
                    </div>
                    <div>
                      <Label htmlFor="time">Visit Time</Label>
                      <TimeSelect
                        id="time"
                        value={newVisit.time}
                        onChange={(time) => setNewVisit({...newVisit, time: time})}
                      />
                      {/*
                        id="time"
                          value={newVisit.time}
                          onChange={(time) => setNewVisit({...newVisit, time: time})} 
                        */}
                    </div>
                    <div>
                      <Label htmlFor="employee">Doctor</Label>
                      <Select onValueChange={(value) => setNewVisit({...newVisit, employee: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select doctor" />
                        </SelectTrigger>
                        <SelectContent>
                          {therapists.map(therapist => (
                            <SelectItem key={therapist.id} value={therapist.id}>
                              {therapist.first_name} {therapist.last_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="sellable">Product/Service</Label>
                      <Select onValueChange={(value) => setNewVisit({...newVisit, sellable: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select product/service" />
                        </SelectTrigger>
                        <SelectContent>
                          {sellables.map(sellable => (
                            <SelectItem key={sellable.id} value={sellable.id}>
                              {sellable.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={newVisit.duration}
                        onChange={(e) => setNewVisit({...newVisit, duration: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="comment">Comment</Label>
                      <Textarea
                        id="comment"
                        value={newVisit.comment}
                        onChange={(e) => setNewVisit({...newVisit, comment: e.target.value})}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="sellable_reduce_balance"
                        checked={newVisit.sellable_reduce_balance}
                        onCheckedChange={(checked) => setNewVisit({...newVisit, sellable_reduce_balance: checked})}
                      />
                      <Label htmlFor="sellable_reduce_balance">Reduce sellable balance</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="walk_in"
                        checked={newVisit.walk_in}
                        onCheckedChange={(checked) => setNewVisit({...newVisit, walk_in: checked})}
                      />
                      <Label htmlFor="walk_in">Walk-in</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="penalty"
                        checked={newVisit.penalty}
                        onCheckedChange={(checked) => setNewVisit({...newVisit, penalty: checked})}
                      />
                      <Label htmlFor="penalty">Penalty</Label>
                    </div>
                  </div>
                  <Button type="submit" className="mt-4">Add Visit</Button>
                </form>
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
        <Dialog open={isVisitDialogOpen} onOpenChange={setIsVisitDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Visit</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddVisit}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="date">Visit Date</Label>
                      <DatePicker
                        id="date"
                        selected={newVisit.date ? new Date(newVisit.date) : null}
                        dateFormat="dd/MM/yyyy"
                        onChange={(date) => setNewVisit({...newVisit, date: date.toISOString().split('T')[0]})}
                        />
                    </div>
                    <div>
                      <Label htmlFor="time">Visit Time</Label>
                      <TimeSelect
                        id="time"
                        value={newVisit.time}
                        onChange={(time) => setNewVisit({...newVisit, time: time})}
                      />
                      {/*
                        id="time"
                          value={newVisit.time}
                          onChange={(time) => setNewVisit({...newVisit, time: time})} 
                        */}
                    </div>
                    <div>
                      <Label htmlFor="employee">Doctor</Label>
                      <Select onValueChange={(value) => setNewVisit({...newVisit, employee: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select doctor" />
                        </SelectTrigger>
                        <SelectContent>
                          {therapists.map(therapist => (
                            <SelectItem key={therapist.id} value={therapist.id}>
                              {therapist.first_name} {therapist.last_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="sellable">Product/Service</Label>
                      <Select onValueChange={(value) => setNewVisit({...newVisit, sellable: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select product/service" />
                        </SelectTrigger>
                        <SelectContent>
                          {sellables.map(sellable => (
                            <SelectItem key={sellable.id} value={sellable.id}>
                              {sellable.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={newVisit.duration}
                        onChange={(e) => setNewVisit({...newVisit, duration: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="comment">Comment</Label>
                      <Textarea
                        id="comment"
                        value={newVisit.comment}
                        onChange={(e) => setNewVisit({...newVisit, comment: e.target.value})}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="sellable_reduce_balance"
                        checked={newVisit.sellable_reduce_balance}
                        onCheckedChange={(checked) => setNewVisit({...newVisit, sellable_reduce_balance: checked})}
                      />
                      <Label htmlFor="sellable_reduce_balance">Reduce sellable balance</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="walk_in"
                        checked={newVisit.walk_in}
                        onCheckedChange={(checked) => setNewVisit({...newVisit, walk_in: checked})}
                      />
                      <Label htmlFor="walk_in">Walk-in</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="penalty"
                        checked={newVisit.penalty}
                        onCheckedChange={(checked) => setNewVisit({...newVisit, penalty: checked})}
                      />
                      <Label htmlFor="penalty">Penalty</Label>
                    </div>
                  </div>
                  <Button type="submit" className="mt-4">Add Visit</Button>
                </form>
              </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default PatientProfile;