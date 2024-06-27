// AppointmentPopup.jsx
import React from 'react';
import format from 'date-fns/format';

const AppointmentPopup = ({ event, onClose, onReschedule, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className='bg-white flex flex-col md:flex-row shadow-xl w-11/12 md:w-3/4 lg:w-1/2 p-4 md:p-6 rounded-lg gap-4 md:gap-10'>

        <div className="flex flex-col justify-start items-start w-full md:w-2/4">
          <h2 className="text-lg md:text-xl font-bold mb-2 md:mb-4">{event.title}</h2>
          <p className="mb-1 md:mb-2"><strong>Patient:</strong> {event.patient}</p>
          <p className="mb-1 md:mb-2"><strong>Doctor:</strong> {event.doctor}</p>
          <p className="mb-1 md:mb-2"><strong>Service:</strong> {event.service}</p>
          <p className="mb-1 md:mb-2"><strong>Date:</strong> {format(event.start, 'MMMM d, yyyy')}</p>
          <p className="mb-1 md:mb-2"><strong>Time:</strong> {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}</p>
          <p className="mb-2 md:mb-4"><strong>Duration:</strong> {(event.end - event.start) / (1000 * 60)} minutes</p>  
        </div>
        
        <div className="flex flex-col justify-center gap-2 md:gap-4 w-full md:w-2/4">
          <button 
            onClick={() => onReschedule(event)}
            className="border border-blue-400 hover:bg-blue-400 hover:text-white text-black px-3 md:px-4 py-2 rounded-md transition duration-200"
          >
            Reschedule Appointment
          </button>
          <button 
            onClick={() => onCancel(event)}
            className="border border-red-500 hover:bg-red-500 hover:text-white text-black px-3 md:px-4 py-2 rounded-md transition duration-200"
          >
            Cancel Appointment
          </button>
          <button 
            onClick={onClose}
            className="border border-blue-400 hover:bg-blue-400 hover:text-white text-black px-3 md:px-4 py-2 rounded-md transition duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentPopup;
