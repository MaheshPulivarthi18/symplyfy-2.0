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
import moment from 'moment';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isSameMonth, startOfDay, endOfDay, isSameDay } from 'date-fns';
import { addWeeks, addMonths, isBefore } from 'date-fns';
import { Toggle } from '../ui/toggle';
import { Button } from '../ui/button';
import { DatePicker } from '../ui/datepicker';
import TimePicker from '../ui/timepicker';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"
import { PlusCircle } from "lucide-react"  // Make sure to import this icon
import { Card } from '../ui/card';


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

// Sample data - replace with your actual data
const patients = ['John Doe', 'Jane Smith', 'Bob Johnson'];
const doctors = ['Dr. Brown', 'Dr. White', 'Dr. Green', 'Dr. Yellow', 'Dr. Red', 'Dr. Orange'];
const doctorColors = {
  'Dr. Brown': '#C4A484',   // Light brown
  'Dr. White': '#E0E0E0',   // Light gray
  'Dr. Green': '#98FB98',   // Pale green
  'Dr. Yellow': '#FAFAD2',  // Light goldenrod yellow
  'Dr. Red': '#FFA07A',     // Light salmon
  'Dr. Orange': '#FFD580'   // Light orange
};
const services = ['Checkup', 'Vaccination', 'Consultation'];
const durationOptions = [30, 45, 60, 90];

export default function Schedule() {
  const [events, setEvents] = useState([]);
  const [view, setView] = useState('day');
  const [date, setDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
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
  const [showFilters, setShowFilters] = useState(false);
  const [showCanceled, setShowCanceled] = useState(false);
  const [calendarStartTime, setCalendarStartTime] = useState(new Date(0, 0, 0, 9, 0)); // 09:00
  const [calendarEndTime, setCalendarEndTime] = useState(new Date(0, 0, 0, 21, 0)); // 21:00

  const handleStartTimeChange = (time) => {
    setCalendarStartTime(time);
  };

  const handleEndTimeChange = (time) => {
    setCalendarEndTime(time);
  };

  // Function to convert time string to minutes
  const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };


  const handleDoctorFilterChange = (doctor) => {
    setSelectedDoctor(prev => prev === doctor ? '' : doctor);
    // Don't clear patient selection anymore
    if (doctor) {
      setView('week');
    }
  };
  
  const handlePatientFilterChange = (patient) => {
    setSelectedPatient(prev => prev === patient ? '' : patient);
    // Don't clear doctor selection anymore
    if (patient) {
      setView('month');
    }
  };
  
  const handleCanceledToggle = () => {
    setShowCanceled(!showCanceled);
    if (!showCanceled) {
      setView('month');
      setSelectedDoctor('');
      setSelectedPatient('');
    }
  };
  
  const clearAllFilters = () => {
    setSelectedDoctor('');
    setSelectedPatient('');
    setShowCanceled(false);
  };

  const handleReschedule = (event) => {
    setNewEvent({
      id: event.id,
      patient: event.patient,
      doctor: event.doctor,
      service: event.service,
      date: event.start,
      time: event.start,
      frequency: 'does not repeat', // Default to non-recurring when rescheduling
      duration: (event.end - event.start) / (1000 * 60),
      resourceId: event.doctor
    });
    setIsRescheduling(true);
    setIsModalOpen(true);
    setSelectedEvent(null);
  };

  const handleCancel = (eventToCancel) => {
    setEvents(prevEvents => prevEvents.map(event => 
      event.id === eventToCancel.id ? { ...event, status: 'cancelled' } : event
    ));
    setSelectedEvent(null);
  };

  const handleDelete = (eventToDelete) => {
    setEvents(prevEvents => prevEvents.filter(event => event.id !== eventToDelete.id));
    setSelectedEvent(null);
  };
  
  const handleMarkVisit = (eventToMark) => {
    setEvents(prevEvents => prevEvents.map(event => 
      event.id === eventToMark.id ? { ...event, status: 'completed' } : event
    ));
    setSelectedEvent(null);
  };

  useEffect(() => {
    const generateRandomEvents = () => {
      const randomEvents = [];
      for (let i = 0; i < 10; i++) {
        const randomDate = new Date(
          new Date().setDate(new Date().getDate() + Math.floor(Math.random() * 10))
        );
        const randomTime = new Date(randomDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60)));
        const duration = durationOptions[Math.floor(Math.random() * durationOptions.length)];
        const endDateTime = new Date(randomTime.getTime() + duration * 60000);
        const doctor = doctors[Math.floor(Math.random() * doctors.length)];
        const patient = patients[Math.floor(Math.random() * patients.length)];
        const service = services[Math.floor(Math.random() * services.length)];
    
        randomEvents.push({
          id: Date.now() + i,
          title: `${patient} - ${service}`, // Ensure this matches the popup display
          start: randomTime,
          end: endDateTime,
          patient: patient,
          doctor: doctor,
          service: service,
          resourceId: doctor,
        });
      }
      setEvents(randomEvents);
    };
  
    generateRandomEvents();
  }, []);

  const sortDoctorsByAppointments = (date) => {
    const startDate = startOfDay(date);
    const endDate = endOfDay(date);

    // Count appointments for each doctor on the given date
    const doctorAppointmentCounts = doctors.reduce((acc, doctor) => {
      acc[doctor] = events.filter(event => 
        event.doctor === doctor && 
        isSameDay(event.start, date)
      ).length;
      return acc;
    }, {});

    // Sort doctors based on appointment count (descending order)
    return doctors.sort((a, b) => doctorAppointmentCounts[b] - doctorAppointmentCounts[a]);
  };

  // Sort doctors whenever the date or events change
  const sortedDoctors = React.useMemo(() => sortDoctorsByAppointments(date), [date, events]);

  const handleSelect = ({ start }) => {
    setNewEvent(prev => ({ ...prev, date: start, time: start }));
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (e) => {
    setNewEvent(prev => ({ ...prev, date: new Date(e.target.value) }));
  };

  const handleTimeChange = (e) => {
    const [hours, minutes] = e.target.value.split(':');
    const newTime = new Date(newEvent.date);
    newTime.setHours(hours);
    newTime.setMinutes(minutes);
    setNewEvent(prev => ({ ...prev, time: newTime }));
  };

  const handleDurationChange = (duration) => {
    if (duration === 'custom') {
      setIsCustomDuration(true);
    } else {
      setNewEvent(prev => ({ ...prev, duration }));
      setIsCustomDuration(false);
    }
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
  };

  const handleBookAppointment = () => {
    const eventDateTime = new Date(
      newEvent.date.getFullYear(),
      newEvent.date.getMonth(),
      newEvent.date.getDate(),
      newEvent.time.getHours(),
      newEvent.time.getMinutes()
    );
  
    const endDateTime = new Date(eventDateTime.getTime() + newEvent.duration * 60000);
  
    const createEvent = (start, end) => ({
      id: Date.now() + Math.random(),
      title: `${newEvent.patient} - ${newEvent.service}`, // Ensure this matches the popup display
      start,
      end,
      patient: newEvent.patient,
      doctor: newEvent.doctor,
      service: newEvent.service,
      resourceId: newEvent.doctor,
      status: 'scheduled'
    });
  
    let eventsToAdd = [];
  
    if (newEvent.frequency === 'weekly') {
      const monthLater = addMonths(eventDateTime, 1);
      let currentStart = eventDateTime;
      let currentEnd = endDateTime;
  
      while (isBefore(currentStart, monthLater)) {
        eventsToAdd.push(createEvent(currentStart, currentEnd));
        currentStart = addWeeks(currentStart, 1);
        currentEnd = addWeeks(currentEnd, 1);
      }
    } else {
      // Single event
      eventsToAdd.push(createEvent(eventDateTime, endDateTime));
    }
  
    if (isRescheduling) {
      setEvents(prevEvents => {
        const filteredEvents = prevEvents.filter(e => e.id !== newEvent.id);
        return [...filteredEvents, ...eventsToAdd];
      });
      setIsRescheduling(false);
    } else {
      setEvents(prevEvents => [...prevEvents, ...eventsToAdd]);
    }
  
    setIsModalOpen(false);
    setNewEvent({
      id: '',
      patient: '',
      doctor: '',
      service: '',
      date: new Date(),
      time: new Date(),
      frequency: 'does not repeat',
      duration: 30,
      resourceId: '',
    });
  };

  const handleAddAppointment = () => {
    setNewEvent({
      id: null,
      patient: '',
      doctor: '',
      service: '',
      date: new Date(),
      time: new Date(),
      frequency: 'does not repeat',
      duration: 30,
    });
    setIsModalOpen(true);
  };

  const handleViewChange = (newView) => {
    setView(newView);
  };

  const jumpToToday = () => {
    setDate(new Date());
  };

  const getFilteredResources = () => {
    if (view === 'week' && selectedDoctor) {
      return [{ id: selectedDoctor, title: selectedDoctor }];
    }
    return doctors.map(doctor => ({ id: doctor, title: doctor }));
  };

  // const filteredEvents = events.filter(event => 
  //   (selectedDoctor ? event.doctor === selectedDoctor : true) &&
  //   (selectedPatient ? event.patient === selectedPatient : true)
  // );

  // const filteredEvents = events.filter(event => 
  //   (!selectedDoctor || event.resourceId === selectedDoctor) &&
  //   (!selectedPatient || event.patient === selectedPatient)
  // );

  const filteredEvents = events.filter(event => 
    (!selectedDoctor || event.resourceId === selectedDoctor) &&
    (!selectedPatient || event.patient === selectedPatient) &&
    (showCanceled ? event.status === 'cancelled' : true)
  );

  // const filteredEvents = events.filter(event => 
  //   (selectedDoctor ? event.doctor === selectedDoctor : true) &&
  //   (selectedPatient ? event.patient === selectedPatient : true) &&
  //   (showCanceled ? true : event.status !== 'cancelled')
  // );

  const ResourceHeader = ({ label }) => (
    <div className="resource-header flex flex-row justify-center gap-4 text-center" style={{ backgroundColor: doctorColors[label] }}>
      <div className="avatar">
        {label.charAt(0)}
      </div>
      <span>{label}</span>
    </div>
  );

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

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

  return (
    <Card className={`p-4 w-full max-w-[90vw] lg:h-[90vh] shadow-lg transition-all duration-500 ease-out ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
      <div className='flex flex-col-reverse lg:flex-row-reverse gap-8 lg:gap-8 w-full h-full'>
        <div className="w-full lg:w-[17.75%] flex flex-col h-full">
          <div className="mb-4 flex-shrink-0">
            <Button onClick={handleAddAppointment} className="flex items-center w-full">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Appointment
            </Button>
          </div>
          <div className="mb-4 flex-shrink-0">
            <div className='flex gap-4 justify-between items-center'>
              <Label htmlFor="startTime">From</Label>
              <TimePicker
                id="startTime"
                value={calendarStartTime}
                onChange={handleStartTimeChange}
              />
            </div>
            <div className='flex gap-4 justify-between items-center mt-2'>
              <Label htmlFor="endTime">To</Label>
              <TimePicker
                id="endTime"
                value={calendarEndTime}
                onChange={handleEndTimeChange}
              />
            </div>
          </div>
          <ScrollArea className="flex-grow overflow-y-auto pr-4">
            <Toggle
              pressed={!selectedDoctor && !selectedPatient}
              onPressedChange={clearAllFilters}
              className="mb-4 w-full"
            >
              {selectedDoctor === "" && selectedPatient === "" ? "Apply Filter" : "Clear All Filters" }
            </Toggle>

            <h1 className='font-bold text-lg mb-2'>Doctors</h1>
            <div className="flex flex-col gap-2 mb-4">
              {doctors.map(doctor => (
                <Toggle
                  key={doctor}
                  pressed={selectedDoctor === doctor}
                  onPressedChange={() => handleDoctorFilterChange(doctor)}
                >
                  {doctor}
                </Toggle>
              ))}
            </div>

            <h1 className='font-bold text-lg mb-2'>Patients</h1>
            <div className="flex flex-col gap-2 mb-4">
              {patients.map(patient => (
                <Toggle
                  key={patient}
                  pressed={selectedPatient === patient}
                  onPressedChange={() => handlePatientFilterChange(patient)}
                >
                  {patient}
                </Toggle>
              ))}
            </div>

            <Toggle onClick={handleCanceledToggle} className="w-full">
              View cancelled Events
            </Toggle>
          </ScrollArea>
        </div>
        <div className="bg-white rounded-lg shadow-lg w-full lg:w-[80%]">
          <Calendar
            localizer={localizer}
            events={filteredEvents}
            startAccessor="start"
            endAccessor="end"
            defaultView={"day"}
            views={["day", "week", "month"]}
            selectable
            resources={getFilteredResources()}
            resourceIdAccessor="id"
            resourceTitleAccessor="title"
            onSelectSlot={handleSelect}
            onSelectEvent={handleSelectEvent}
            view={view}
            onView={setView}
            date={date}
            onNavigate={setDate}
            className="font-sans"
            style={{ minHeight: '500px' }}
            components={{
              toolbar: CustomToolbar,
              resourceHeader: ResourceHeader,
            }}
            min={calendarStartTime}
            max={calendarEndTime}
            eventPropGetter={(event) => {
              let newStyle = {
                backgroundColor: doctorColors[event.doctor],
                color: 'black',
              };
              if (event.status === 'cancelled') {
                newStyle.backgroundColor = 'lightgrey';
                newStyle.color = 'darkgrey'
              } else if (event.status === 'completed') {
                newStyle.backgroundColor = 'lightgreen';
              }
              return { style: newStyle };
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
          doctorColors={doctorColors}
        />
      )}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isRescheduling ? 'Reschedule Appointment' : 'Book Appointment'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="patient" className="text-right">
                Patient
              </Label>
              <Select name="patient" value={newEvent.patient} onValueChange={(value) => handleInputChange({ target: { name: 'patient', value }})}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select Patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map(patient => (
                    <SelectItem key={patient} value={patient}>{patient}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="doctor" className="text-right">
                Doctor
              </Label>
              <Select name="doctor" value={newEvent.doctor} onValueChange={(value) => handleInputChange({ target: { name: 'doctor', value }})}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select Doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map(doctor => (
                    <SelectItem key={doctor} value={doctor}>{doctor}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="service" className="text-right">
                Service
              </Label>
              <Select name="service" value={newEvent.service} onValueChange={(value) => handleInputChange({ target: { name: 'service', value }})}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select Service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map(service => (
                    <SelectItem key={service} value={service}>{service}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <DatePicker
                value={newEvent.date}
                onChange={(date) => handleInputChange({ target: { name: 'date', value: date }})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="time" className="text-right">
                Time
              </Label>
              <TimePicker
                value={newEvent.time}
                onChange={(time) => handleInputChange({ target: { name: 'time', value: time }})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="frequency" className="text-right">
                Frequency
              </Label>
              <Select name="frequency" value={newEvent.frequency} onValueChange={(value) => handleInputChange({ target: { name: 'frequency', value }})}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="does not repeat">Does not repeat</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Duration</Label>
              <div className="col-span-3 flex flex-wrap gap-2">
                {durationOptions.map(duration => (
                  <Button
                    key={duration}
                    variant={newEvent.duration === duration ? "default" : "outline"}
                    onClick={() => handleDurationChange(duration)}
                  >
                    {duration} mins
                  </Button>
                ))}
                <Button
                  variant={isCustomDuration ? "default" : "outline"}
                  onClick={() => handleDurationChange('custom')}
                >
                  Custom
                </Button>
              </div>
            </div>
            {isCustomDuration && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="customDuration" className="text-right">
                  Custom Duration
                </Label>
                <Input
                  id="customDuration"
                  type="number"
                  name="duration"
                  value={newEvent.duration}
                  onChange={handleInputChange}
                  placeholder="Enter duration in minutes"
                  className="col-span-3"
                />
              </div>
            )}
          </div>
          <Button onClick={handleBookAppointment}>
            {isRescheduling ? 'Reschedule Appointment' : 'Book Appointment'}
          </Button>
        </DialogContent>
      </Dialog>
    </Card>
  );
}