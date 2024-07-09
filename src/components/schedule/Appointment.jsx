// AppointmentPopup.jsx
import React from 'react';
import format from 'date-fns/format';

const AppointmentPopup = ({ event, onClose, onReschedule, onCancel, onDelete, onMarkVisit, doctorColors }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl min-w-96 w-[20%] flex flex-row justify-between" style={{ borderLeft: `4px solid ${doctorColors[event.doctor]}` }}>
        <div className=' text-start'>
          <h2 className="text-xl font-bold mb-4">{event.title}</h2>
          <p className="mb-2"><strong>Patient:</strong> {event.patient}</p>
          <p className="mb-2"><strong>Doctor:</strong> {event.doctor}</p>
          <p className="mb-2"><strong>Service:</strong> {event.service}</p>
          <p className="mb-2"><strong>Date:</strong> {format(event.start, 'MMMM d, yyyy')}</p>
          <p className="mb-2"><strong>Time:</strong> {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}</p>
          <p className="mb-4"><strong>Duration:</strong> {(event.end - event.start) / (1000 * 60)} minutes</p>
          <p className="mb-4"><strong>Status:</strong> {event.status}</p>
        </div>
        <div className="flex flex-col flex-wrap justify-between">
          <button 
            onClick={() => onMarkVisit(event)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition duration-200 mb-2"
          >
            Mark Visited
          </button>
          <button 
            onClick={() => onReschedule(event)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md transition duration-200 mb-2"
          >
            Reschedule
          </button>
          <button 
            onClick={() => onCancel(event)}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition duration-200 mb-2"
          >
            Cancel
          </button>
          <button 
            onClick={() => onDelete(event)}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition duration-200 mb-2"
          >
            Delete
          </button>
          <button 
            onClick={onClose}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition duration-200 mb-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentPopup;
