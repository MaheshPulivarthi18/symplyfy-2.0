// schedule.jsx
import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import parse from 'date-fns/parse';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import AppointmentPopup from './Appointment';
import './Schedule.css'
import moment from 'moment';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isSameMonth, startOfDay, endOfDay, isSameDay } from 'date-fns';
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
  const [calendarStartTime, setCalendarStartTime] = useState('09:00');
  // const [calendarEndTime, setCalendarEndTime] = useState('21:00');
  const [calendarEndTime, setCalendarEndTime] = useState('21:00');

  const handleStartTimeChange = (e) => {
    setCalendarStartTime(e.target.value);
  };

  const handleEndTimeChange = (e) => {
    setCalendarEndTime(e.target.value);
  };

  // Function to convert time string to minutes
  const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };


  const handleDoctorFilterChange = (e) => {
    const selectedValue = e.target.value;
    setSelectedDoctor(selectedValue);
    if (selectedValue) {
      setView('week');
    }
  };

  const handlePatientFilterChange = (e) => {
    const selectedValue = e.target.value;
    setSelectedPatient(selectedValue);
    if (selectedValue) {
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

  const ResourceHeader = ({ label }) => (
    <div className="resource-header flex flex-row justify-center gap-4 text-center" style={{ backgroundColor: doctorColors[label] }}>
      <div className="avatar">
        {label.charAt(0)}
      </div>
      <span>{label}</span>
    </div>
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
    <div className="p-4 w-[70vw]">
      <h1 className="text-2xl font-bold mb-4">Schedule</h1>
      <div className="mb-4 relative flex justify-end ">

      <div className="mb-4 flex space-x-4 mr-4">
        <p className='font-bold mt-1'>From</p>
          <div>
            {/* <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">Start Time</label> */}
            <input
              type="time"
              id="startTime"
              value={calendarStartTime}
              onChange={handleStartTimeChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <p className='font-bold mt-1'>to</p>
          <div>
            {/* <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">End Time</label> */}
            <input
              type="time"
              id="endTime"
              value={calendarEndTime}
              onChange={handleEndTimeChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
            />
          </div>
        </div>

        <button 
          className={`cursor-pointer p-2 rounded ${showCanceled ? 'bg-red-500 text-white' : 'hover:bg-blue-600'} bg-blue-500 text-white px-4 py-2 rounded-md mb-2 mr-4`}
          onClick={handleCanceledToggle}
        >
          View Canceled Events
        </button>

        <button 
          onClick={() => setShowFilters(!showFilters)} 
          className="bg-blue-500 text-white px-4 py-2 rounded-md mb-2 hover:bg-blue-600"
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>

        
        {showFilters && (
          <div className="bg-gray-100 p-4 rounded-md absolute top-10 z-10 max-w-2/3">
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
      <div className="relative bg-white rounded-lg shadow-lg h-[75vh]">
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
            components={{
              toolbar: CustomToolbar,
              resourceHeader: ResourceHeader,
            }}
            min={new Date(0, 0, 0, ...calendarStartTime.split(':'))}
            max={new Date(0, 0, 0, ...calendarEndTime.split(':'))}
            eventPropGetter={(event) => {
              let newStyle = {
                backgroundColor: doctorColors[event.doctor],
                color: 'black',
              };
              if (event.status === 'cancelled') {
                newStyle.backgroundColor = 'lightgrey';
              } else if (event.status === 'completed') {
                newStyle.backgroundColor = 'lightgreen';
              }
              return { style: newStyle };
            }}
          />
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