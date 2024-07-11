// AppointmentPopup.jsx
import React from 'react';
import format from 'date-fns/format';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const AppointmentPopup = ({ event, onClose, onReschedule, onCancel, onDelete, onMarkVisit, doctorColors }) => {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">{event.title}</DialogTitle>
        </DialogHeader>
        <div className='flex items-center gap-4'>

          <div className="grid gap-4 py-4" style={{ borderLeft: `4px solid ${doctorColors[event.doctor]}`, paddingLeft: '1rem' }}>
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
              <span className="col-span-3">{event.service}</span>
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
              <span className="font-bold">Duration:</span>
              <span className="col-span-3">{(event.end - event.start) / (1000 * 60)} minutes</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="font-bold">Status:</span>
              <Badge variant={event.status === 'cancelled' ? 'destructive' : 'default'}>
                {event.status}
              </Badge>
            </div>
          </div>
          <div className="flex flex-col gap-2 mt-4">
            <Button variant="default" onClick={() => onMarkVisit(event)}>
              Mark Visited
            </Button>
            <Button variant="secondary" onClick={() => onReschedule(event)}>
              Reschedule
            </Button>
            <Button variant="outline" onClick={() => onCancel(event)}>
              Cancel
            </Button>
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