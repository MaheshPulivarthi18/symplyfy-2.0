// AppointmentPopup.jsx
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from '../ui/datepicker';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const AppointmentPopup = ({ event, onClose, onReschedule, onCancel, onDelete, onMarkVisit, sellables }) => {
  const [isSheetOpen, setIsSheetOpen] = useState(true);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMarkVisitDialogOpen, setIsMarkVisitDialogOpen] = useState(false);
  const [cancelAllUpcoming, setCancelAllUpcoming] = useState(false);
  const [cancelRequestedByPatient, setCancelRequestedByPatient] = useState(false);
  const [visitDetails, setVisitDetails] = useState({
    visitedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    product: event.service || '',
    walkIn: false,
    markPenalty: false,
    removeSessionBalance: false,
  });
  const [date, setDate] = useState(new Date());
  const [deleteScope, setDeleteScope] = useState('single');
  const [cancelScope, setCancelScope] = useState('T');
  const [tillDate, setTillDate] = useState(null);

  useEffect(() => {
    setIsSheetOpen(true);
  }, [event]);

  const handleClose = () => {
    setIsSheetOpen(false);
    onClose();
  };

  const handleCancelClick = () => {
    onCancel(event, cancelScope, tillDate);
    setIsCancelDialogOpen(false);
    handleClose();
  };

  const handleReschedule = () => {
    onReschedule(event);
    setIsRescheduleDialogOpen(false);
    handleClose();
  };

  const handleDelete = () => {
    onDelete(event);
    setIsDeleteDialogOpen(false);
    handleClose();
  };

  const handleMarkVisit = () => {
    onMarkVisit(event);
    handleClose();
  };

  const handleMarkVisitClick = () => {
    setIsMarkVisitDialogOpen(true);
  };

  const handleSessionCompleted = () => {
    onMarkVisit(event.id, visitDetails);
    setIsMarkVisitDialogOpen(false);
    handleClose();
  };

  const isEventCancelled = event.status_patient === 'X' || event.status_employee === 'X';

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
    <>
      <Sheet className='' open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="bottom" className={`w-[25%] left-[37%] items-center ${isEventCancelled ? "bottom-[50%]" : "bottom-[30%]" }`}>
          <SheetHeader>
            <SheetTitle>{event.title + " - " + event.doctor}</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            {!isEventCancelled && (
              <>
                <Button className="w-full mb-2" onClick={handleMarkVisitClick}>
                  Mark Patient Visit
                </Button>
                <Button className="w-full mb-2" variant="outline" onClick={() => setIsCancelDialogOpen(true)}>
                  Cancel Appointment
                </Button>
                <Button className="w-full mb-2" variant="outline" onClick={() => setIsRescheduleDialogOpen(true)}>
                  Reschedule Appointment
                </Button>
                <Button className="w-full mb-2" variant="outline" onClick={() => setIsDeleteDialogOpen(true)}>
                  Delete Appointment
                </Button>
              </>
            )}
            <Button className="w-full mb-2" variant="outline">
              View Patient Details
            </Button>
            <Button className="w-full mb-2" variant="outline">
              Record New Payment
            </Button>
            <Button className="w-full" variant="outline">
              Call ({event.phoneNumber || '+919182664777'})
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Appointment</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <RadioGroup value={cancelScope} onValueChange={setCancelScope}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="T" id="cancelSingle" />
              <label htmlFor="cancelSingle">Cancel this appointment</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="F" id="cancelFuture" />
              <label htmlFor="cancelFuture">Cancel this and future appointments</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="A" id="cancelAll" />
              <label htmlFor="cancelAll">Cancel all appointments</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="D" id="cancelTillDate" />
              <label htmlFor="cancelTillDate">Cancel till date</label>
            </div>
          </RadioGroup>
          
          {cancelScope === 'D' && (
            <div className="mt-4">
              <label htmlFor="tillDate">Cancel till:</label>
              <DatePicker
                id="tillDate"
                selected={tillDate}
                onChange={setTillDate}
                minDate={new Date()}
              />
            </div>
          )}

          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>Back</Button>
            <Button onClick={handleCancelClick}>Cancel Appointment(s)</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

      <Dialog open={isRescheduleDialogOpen} onOpenChange={setIsRescheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Do you want to Reschedule this Appointment?</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsRescheduleDialogOpen(false)}>Back</Button>
              <Button onClick={handleReschedule}>Reschedule</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* <Button onClick={() => setIsDeleteDialogOpen(true)}>Delete</Button> */}

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Appointment</DialogTitle>
          </DialogHeader>
          <RadioGroup value={deleteScope} onValueChange={setDeleteScope}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="single" id="delete-single" />
              <Label htmlFor="delete-single">Delete this appointment only</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="recurrence" id="delete-recurrence" />
              <Label htmlFor="delete-recurrence">Delete all recurring appointments</Label>
            </div>
          </RadioGroup>
          <Button onClick={handleDelete}>Confirm Delete</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={isMarkVisitDialogOpen} onOpenChange={setIsMarkVisitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Patient Visit</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="mb-4">
              <Label>Visit Date (DD/MM/YYYY)</Label>
              <DatePicker
                id="date"
                selected={visitDetails.visitedDate}
                onChange={(date) => setVisitDetails({...visitDetails, visitedDate: date.toISOString().split('T')[0]})}
                dateFormat="dd/MM/yyyy"
              />
            </div>
            <div className="mb-4">
              <Label>Visited Time</Label>
              <TimeSelect
                id="time"
                value={visitDetails.visitedTime}
                onChange={(time) => setVisitDetails({ ...visitDetails, visitedTime: time })}
              />
            </div>
            <div className="mb-4">
              <Label>Product / Service</Label>
              <Select
                value={visitDetails.product}
                onValueChange={(value) => setVisitDetails({ ...visitDetails, product: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Product / Service" />
                </SelectTrigger>
                <SelectContent>
                  {sellables.map((sellable) => (
                    <SelectItem key={sellable.id} value={sellable.id}>
                      {sellable.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2 mb-4">
              <Checkbox
                id="walkIn"
                checked={visitDetails.walkIn}
                onCheckedChange={(checked) => setVisitDetails({ ...visitDetails, walkIn: checked })}
              />
              <Label htmlFor="walkIn">Walk In</Label>
            </div>
            <div className="flex items-center space-x-2 mb-4">
              <Checkbox
                id="markPenalty"
                checked={visitDetails.markPenalty}
                onCheckedChange={(checked) => setVisitDetails({ ...visitDetails, markPenalty: checked })}
              />
              <Label htmlFor="markPenalty">Mark Penalty</Label>
            </div>
            <div className="flex items-center space-x-2 mb-4">
              <Checkbox
                id="removeSessionBalance"
                checked={visitDetails.removeSessionBalance}
                onCheckedChange={(checked) => setVisitDetails({ ...visitDetails, removeSessionBalance: checked })}
              />
              <Label htmlFor="removeSessionBalance">Remove Session Balance</Label>
            </div>
            <Button onClick={handleSessionCompleted} className="w-full">
              Session Completed
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AppointmentPopup;