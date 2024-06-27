// schedule.jsx
import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import parse from 'date-fns/parse';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import AppointmentPopup from './schedule/Appointment';
import './schedule/Schedule.css'
import moment from 'moment';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isSameMonth } from 'date-fns';
import { addWeeks, addMonths, isBefore } from 'date-fns';

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
const doctors = ['Dr. Brown', 'Dr. White', 'Dr. Green'];
const services = ['Checkup', 'Vaccination', 'Consultation'];
const durationOptions = [30, 45, 60, 90];

export default function Schedule() {
  const [events, setEvents] = useState([]);
  const [view, setView] = useState('month');
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


    const handlePatientFilterChange = (e) => {
        setSelectedPatient(e.target.value);
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
          duration: (event.end - event.start) / (1000 * 60)
        });
        setIsRescheduling(true);
        setIsModalOpen(true);
        setSelectedEvent(null);
      };

  const handleCancel = (eventToCancel) => {
    setEvents(prevEvents => prevEvents.filter(event => 
      event.start !== eventToCancel.start || 
      event.end !== eventToCancel.end || 
      event.title !== eventToCancel.title
    ));
    setSelectedEvent(null);
  };

  useEffect(() => {
    const generateRandomEvents = () => {
      const randomEvents = [];
      for (let i = 0; i < 10; i++) {
        const randomDate = new Date(
          new Date().setDate(new Date().getDate() + Math.floor(Math.random() * 30))
        );
        const randomTime = new Date(randomDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60)));
        const duration = durationOptions[Math.floor(Math.random() * durationOptions.length)];
        const endDateTime = new Date(randomTime.getTime() + duration * 60000);
  
        randomEvents.push({
          id: Date.now() + i, // Ensure unique ID
          title: `${patients[Math.floor(Math.random() * patients.length)]} - ${services[Math.floor(Math.random() * services.length)]}`,
          start: randomTime,
          end: endDateTime,
          patient: patients[Math.floor(Math.random() * patients.length)],
          doctor: doctors[Math.floor(Math.random() * doctors.length)],
          service: services[Math.floor(Math.random() * services.length)],
        });
      }
      setEvents(randomEvents);
    };
  
    generateRandomEvents();
  }, []);

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
      id: Date.now() + Math.random(), // Ensure unique ID for each event
      title: `${newEvent.patient} - ${newEvent.service}`,
      start,
      end,
      patient: newEvent.patient,
      doctor: newEvent.doctor,
      service: newEvent.service,
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
    });
  };

  const handleViewChange = (newView) => {
    setView(newView);
  };

  const jumpToToday = () => {
    setDate(new Date());
  };

  const handleDoctorFilterChange = (e) => {
    setSelectedDoctor(e.target.value);
  };

  const filteredEvents = events.filter(event => 
    (selectedDoctor ? event.doctor === selectedDoctor : true) &&
    (selectedPatient ? event.patient === selectedPatient : true)
  );

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
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Schedule</h1>
      <div className="mb-4 relative flex justify-end">
            <button 
            onClick={() => setShowFilters(!showFilters)} 
            className="bg-blue-500 text-white px-4 py-2 rounded-md mb-2"
            >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            
            {showFilters && (
            <div className="bg-gray-100 p-4 rounded-md w-96 absolute top-10 z-10">
                <div className="mb-2">
                <label className="block mb-1">Filter by Doctor</label>
                <select 
                    value={selectedDoctor} 
                    onChange={handleDoctorFilterChange} 
                    className="w-full p-2 border rounded"
                >
                    <option value="">All Doctors</option>
                    {doctors.map(doctor => (
                    <option key={doctor} value={doctor}>{doctor}</option>
                    ))}
                </select>
                </div>
                
                <div>
                <label className="block mb-1">Filter by Patient</label>
                <select 
                    value={selectedPatient} 
                    onChange={handlePatientFilterChange} 
                    className="w-full p-2 border rounded"
                >
                    <option value="">All Patients</option>
                    {patients.map(patient => (
                    <option key={patient} value={patient}>{patient}</option>
                    ))}
                </select>
                </div>
            </div>
            )}
        </div>
      <div className="relative bg-white rounded-lg shadow-lg overflow-hidden h-[75vh]">
        <Calendar
            localizer={localizer}
            events={filteredEvents}
            // formats={{dayHeaderFormat:(date)=>moment(date).format("dddd, MMMM, DD")}}
            startAccessor="start"
            endAccessor="end"
            defaultView={'week'}
            selectable
            onSelectSlot={handleSelect}
            onSelectEvent={handleSelectEvent}
            onView={handleViewChange}
            date={date}
            onNavigate={setDate}
            views={['day', 'week', 'month']}
            className="font-sans"
            components={{
                toolbar: CustomToolbar
            }}
            />
      </div>
      {selectedEvent && (
        <AppointmentPopup 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)}
          onReschedule={handleReschedule}
          onCancel={handleCancel}
        />
      )}
      {isModalOpen && (
          <div className="absolute inset-0 bg-transparent z-40" />
        )}
    {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" 
            onClick={() => setIsModalOpen(false)}>
          <div className="relative top-20 mx-auto p-5 border w-[500px] shadow-lg rounded-md bg-white" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">{isRescheduling ? 'Reschedule Appointment' : 'Book Appointment'}</h2>
            <div className="mb-4 flex items-center">
              <label className="w-1/3">Patient</label>
              <select name="patient" value={newEvent.patient} onChange={handleInputChange} className="w-2/3 p-2 border rounded">
                <option value="">Select Patient</option>
                {patients.map(patient => (
                  <option key={patient} value={patient}>{patient}</option>
                ))}
              </select>
            </div>
            <div className="mb-4 flex items-center">
              <label className="w-1/3">Doctor</label>
              <select name="doctor" value={newEvent.doctor} onChange={handleInputChange} className="w-2/3 p-2 border rounded">
                <option value="">Select Doctor</option>
                {doctors.map(doctor => (
                  <option key={doctor} value={doctor}>{doctor}</option>
                ))}
              </select>
            </div>
            <div className="mb-4 flex items-center">
              <label className="w-1/3">Service</label>
              <select name="service" value={newEvent.service} onChange={handleInputChange} className="w-2/3 p-2 border rounded">
                <option value="">Select Service</option>
                {services.map(service => (
                  <option key={service} value={service}>{service}</option>
                ))}
              </select>
            </div>
            <div className="mb-4 flex items-center">
              <label className="w-1/3">Date</label>
              <input type="date" value={newEvent.date.toISOString().split('T')[0]} onChange={handleDateChange} className="w-2/3 p-2 border rounded" />
            </div>
            <div className="mb-4 flex items-center">
                <label className="w-1/3">Time</label>
                <input type="time" value={`${newEvent.time.getHours().toString().padStart(2, '0')}:${newEvent.time.getMinutes().toString().padStart(2, '0')}`} onChange={handleTimeChange} className="w-2/3 p-2 border rounded" />
            </div>
            <div className="mb-4 flex items-center">
                <label className="w-1/3">Frequency</label>
                <select 
                    name="frequency" 
                    value={newEvent.frequency} 
                    onChange={handleInputChange} 
                    className="w-2/3 p-2 border rounded"
                >
                    <option value="does not repeat">Does not repeat</option>
                    <option value="weekly">Weekly</option>
                </select>
            </div>
            <div className="mb-4 flex items-center">
              <label className="block mb-2 w-1/3">Duration</label>
              <div className="flex flex-wrap gap-2 w-2/3">
                {durationOptions.map(duration => (
                  <button
                    key={duration}
                    onClick={() => handleDurationChange(duration)}
                    className={`px-4 py-2 rounded ${newEvent.duration === duration ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  >
                    {duration} mins
                  </button>
                ))}
                <button
                  onClick={() => handleDurationChange('custom')}
                  className={`px-4 py-2 rounded ${isCustomDuration ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                  Custom
                </button>
              </div>
              {isCustomDuration && (
                <input
                  type="number"
                  name="duration"
                  value={newEvent.duration}
                  onChange={handleInputChange}
                  className="mt-2 w-full p-2 border rounded"
                  placeholder="Enter duration in minutes"
                />
              )}
            </div>
            <button onClick={handleBookAppointment} className="w-full mt-4 bg-blue-500 text-white px-4 py-2 rounded">
            {isRescheduling ? 'Reschedule Appointment' : 'Book Appointment'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}