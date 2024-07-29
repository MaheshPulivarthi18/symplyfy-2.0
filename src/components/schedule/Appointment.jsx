// AppointmentPopup.jsx
import React from 'react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const AppointmentPopup = ({ event, onClose, onReschedule, onCancel, onDelete, onMarkVisit }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-500';
      case 'cancelled':
        return 'bg-red-500';
      case 'completed':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="w-[35vw] mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">{event.title}</DialogTitle>
        </DialogHeader>
        <div className='flex flex-col md:flex-row items-start gap-6'>
          <div className="grid gap-4 py-4 flex-grow" style={{ borderLeft: `4px solid ${getStatusColor(event.status)}`, paddingLeft: '1rem' }}>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="font-bold">Patient:</span>
              <span className="col-span-3">{event.patient}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="font-bold">Doctor:</span>
              <span className="col-span-3">{event.doctor}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="font-bold">Service:</span>
              <span className="col-span-3">{(event.service === null) ? ("N/A") : (event.service)}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="font-bold">Date:</span>
              <span className="col-span-3">{format(event.start, 'MMMM d, yyyy')}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="font-bold">Time:</span>
              <span className="col-span-3">{format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="font-bold mr-4">Duration:</span>
              <span className="col-span-3 ml-4">{(event.end - event.start) / (1000 * 60)} minutes</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="font-bold">Status:</span>
              <Badge variant={event.status === 'cancelled' ? 'destructive' : 'default'} className={getStatusColor(event.status)}>
                {event.status}
              </Badge>
            </div>
          </div>
          <div className="flex flex-col gap-4 mt-4">
            {event.status !== 'completed' && (
              <Button variant="default" onClick={() => onMarkVisit(event)}>
                Mark Completed
              </Button>
            )}
            {event.status !== 'cancelled' && event.status !== 'completed' && (
              <>
                <Button variant="secondary" onClick={() => {
                  onClose(); // Close the popup
                  onReschedule(event); // Call the reschedule function
                }}>
                  Reschedule
                </Button>
                <Button variant="outline" onClick={() => onCancel(event)}>
                  Cancel
                </Button>
              </>
            )}
            <Button variant="destructive" onClick={() => onDelete(event)}>
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentPopup;