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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  const [visits, setVisits] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [sellables, setSellables] = useState([]);
  
  const [progress, setProgress] = useState(0);
  const [newNote, setNewNote] = useState({ description: '', visible_to_patient: false });
  const [newGoal, setNewGoal] = useState({ title: '', description: '', complete_by: '' });
  const [newTask, setNewTask] = useState({ name: '', description: '', repetitions: 0, goal: '' });
  const [newVisit, setNewVisit] = useState({
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
    therapist: '', // Add this line
  });

  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isVisitDialogOpen, setIsVisitDialogOpen] = useState(false);
  const [openNoteDialogs, setOpenNoteDialogs] = useState({});
  const [openGoalDialogs, setOpenGoalDialogs] = useState({});

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

  
  const fetchVisits = async () => {
    try {
      const data = await fetchWithTokenHandling(`${import.meta.env.VITE_BASE_URL}/api/emp/clinic/${clinic_id}/patient/${patient_id}/visit/`);
      setVisits(data);
      console.log(visits)
    } catch (error) {
      console.error("Failed to fetch visits:", error);
      setVisits([]);
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

  const addVisit = async () => {
    try {
      // Indian time zone offset is UTC+5:30
      const indianTimeZoneOffset = 330; // 5 hours and 30 minutes in minutes
      
      // Parse the date and time and adjust for Indian time zone
      const localStartDateTime = parseISO(`${newVisit.date}T${newVisit.time}`);
      const startDateTime = addMinutes(localStartDateTime, -indianTimeZoneOffset);
      const endDateTime = addMinutes(startDateTime, newVisit.duration || parseInt(newVisit.customDuration));
  
      // Convert weekdays to the format expected by the backend (e.g., "MO,TU,WE")
      const weekdayMap = {
        'Mon': 'MO', 'Tue': 'TU', 'Wed': 'WE', 'Thu': 'TH', 'Fri': 'FR', 'Sat': 'SA', 'Sun': 'SU'
      };
      const formattedWeekdays = newVisit.weekdays.map(day => weekdayMap[day]).join(',');
  
      let recurrenceRule = null;
      if (newVisit.frequency === 'weekly') {
        recurrenceRule = `RRULE:FREQ=WEEKLY;BYDAY=${formattedWeekdays}`;
        if (newVisit.endsOn) {
          const endDate = addMinutes(parseISO(newVisit.endsOn), -indianTimeZoneOffset);
          recurrenceRule += `;UNTIL=${format(endDate, "yyyyMMdd'T'HHmmss'Z'")}`;
        } else if (newVisit.sessions) {
          recurrenceRule += `;COUNT=${newVisit.sessions}`;
        }
      }
  
      const bookingData = {
        start: format(startDateTime, "yyyy-MM-dd'T'HH:mm:ss'Z'"),
        end: format(endDateTime, "yyyy-MM-dd'T'HH:mm:ss'Z'"),
        patient: patient.id,
        employee: newVisit.therapist,
        sellable: newVisit.sellable,
        recurrence: recurrenceRule,
      };
  
      const bookings = await createBooking(bookingData);
      
      // Ensure bookings is an array
      if (!Array.isArray(bookings)) {
        throw new Error('Unexpected response format from createBooking');
      }
  
      // Extract the ID of the last (most recent) booking
      const lastBookingId = bookings[bookings.length - 1].id;
  
      // Now create the visit with the last booking ID
      const visitData = {
        booking: lastBookingId,
        date: format(localStartDateTime, 'yyyy-MM-dd'),
        time: format(localStartDateTime, 'HH:mm'),
        sellable_reduce_balance: true, // You might want to add a checkbox for this
      };
  
      const response = await fetchWithTokenHandling(`${import.meta.env.VITE_BASE_URL}/api/emp/clinic/${clinic_id}/patient/${patient.id}/visit/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(visitData),
      });
  
      const newVisitData = await response;
      setVisits([...visits, newVisitData]);
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
      toast({ title: "Success", description: "Appointment booked successfully" });
      fetchVisits();
      setIsVisitDialogOpen(false); // Close the dialog
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



  useEffect(() => {
    fetchPatientData();
    fetchNotes();
    fetchGoals();
    fetchTasks();
    fetchVisits();
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

  return (
    <div className="flex w-full gap-8 p-8 container mx-auto shadow-xl">
      <Card className="w-[45%]">
        <CardHeader>
          <CardTitle>Patient Information</CardTitle>
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
                <Link to={`/clinic/${clinic_id}/patient/${patient_id}/schedule`}>
                  <Button variant="outline">View Schedule</Button>
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="w-full space-y-8">
        <Tabs className='w-full' defaultValue="notes">
          <TabsList className='w-full justify-around'>
            <TabsTrigger className='px-12' value="notes">Notes</TabsTrigger>
            <TabsTrigger className='px-12' value="goals">Goals</TabsTrigger>
            <TabsTrigger className='px-12' value="visits">Upcoming Visits</TabsTrigger>
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
                <Button className="absolute bottom-0 left-0">Add New Task</Button>
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
          
          {/* Visits TabsContent */}
          <TabsContent value="visits" className="relative min-h-[300px] p-4 pb-16">
            {visits.length === 0 ? (
              <p>No visits scheduled for this patient.</p>
              ) : (
                visits.map(visit => (
                  <div key={visit.id} className="p-2 bg-gray-100 rounded mb-2">
                    <p>Date: {visit.date}</p>
                    <p>Time: {visit.time}</p>
                    <p>Comment: {visit.comment}</p>
                    <p>Employee ID: {visit.employee}</p>
                    <p>Walk-in: {visit.walk_in ? 'Yes' : 'No'}</p>
                    <p>Penalty: {visit.penalty ? 'Yes' : 'No'}</p>
                  </div>
                ))
            )}
            <Dialog open={isVisitDialogOpen} onOpenChange={setIsVisitDialogOpen}>
              <DialogTrigger asChild>
                <Button>Add Appointment</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add Appointment</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Select onValueChange={(value) => setNewVisit({...newVisit, patient: value})}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Patient" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.first_name} {patient.last_name}
                        </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">Add patient before scheduling Appointment</p>

                  <Select onValueChange={(value) => setNewVisit({...newVisit, therapist: value})}>
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

                  <Select onValueChange={(value) => setNewVisit({...newVisit, sellable: value})}>
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
                          selected={newVisit.date ? new Date(newVisit.date) : null}
                          onChange={(date) => setNewVisit({...newVisit, date: date.toISOString().split('T')[0]})}
                          dateFormat="dd/MM/yyyy"
                        />
                      </div>
                      <div>
                        <Label htmlFor="time">Time</Label>
                        <TimeSelect
                          id="time"
                          value={newVisit.time}
                          onChange={(time) => setNewVisit({...newVisit, time: time})}
                        />
                      </div>
                    </div>
                  </div>

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
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {newVisit.endsOn ? format(new Date(newVisit.endsOn), "PPP") : <span>Pick an end date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={newVisit.endsOn ? new Date(newVisit.endsOn) : undefined}
                              onSelect={(date) => setNewVisit({...newVisit, endsOn: date ? date.toISOString().split('T')[0] : ''})}
                            />
                          </PopoverContent>
                        </Popover>
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
                <Button onClick={addVisit} className="w-full">Book Appointment</Button>
              </DialogContent>
            </Dialog>
          </TabsContent>
          <TabsContent value="payments">
            <p>Payment information is not available at the moment.</p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PatientProfile;