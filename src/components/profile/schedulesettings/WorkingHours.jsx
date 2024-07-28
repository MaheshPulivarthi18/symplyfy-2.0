import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from "@/components/ui/switch"

const timeSchema = z.object({
  start: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format"),
  end: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format"),
});

const workingHoursSchema = z.object({
  everyday: z.array(timeSchema).min(1, "At least one time slot is required"),
  monday: z.array(timeSchema),
  tuesday: z.array(timeSchema),
  wednesday: z.array(timeSchema),
  thursday: z.array(timeSchema),
  friday: z.array(timeSchema),
  saturday: z.array(timeSchema),
  sunday: z.array(timeSchema),
});

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

const WorkingHours = () => {
  const { clinic_id } = useParams();
  const { toast } = useToast();
  const { authenticatedFetch } = useAuth();
  const [useEverydaySchedule, setUseEverydaySchedule] = useState(true);

  const form = useForm({
    resolver: zodResolver(workingHoursSchema),
    defaultValues: {
      everyday: [{ start: '', end: '' }],
      monday: [{ start: '', end: '' }],
      tuesday: [{ start: '', end: '' }],
      wednesday: [{ start: '', end: '' }],
      thursday: [{ start: '', end: '' }],
      friday: [{ start: '', end: '' }],
      saturday: [{ start: '', end: '' }],
      sunday: [{ start: '', end: '' }],
    },
  });

  const { fields: everydayFields, append: appendEveryday, remove: removeEveryday } = useFieldArray({
    control: form.control,
    name: "everyday",
  });

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayFields = {};
  const dayAppend = {};
  const dayRemove = {};

  days.forEach(day => {
    const { fields, append, remove } = useFieldArray({
      control: form.control,
      name: day,
    });
    dayFields[day] = fields;
    dayAppend[day] = append;
    dayRemove[day] = remove;
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await authenticatedFetch(`${import.meta.env.VITE_BASE_URL}/api/emp/clinic/${clinic_id}/schedule/settings/`);
      if (!response.ok) throw new Error('Failed to fetch settings');
      const data = await response.json();
      if (data.working_hours) {
        const isEverydaySchedule = days.every(day => 
          JSON.stringify(data.working_hours[day]) === JSON.stringify(data.working_hours.monday)
        );
        setUseEverydaySchedule(isEverydaySchedule);
        if (isEverydaySchedule) {
          form.reset({ everyday: data.working_hours.monday });
        } else {
          form.reset(data.working_hours);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (values) => {
    try {
      let workingHours;
      if (useEverydaySchedule) {
        workingHours = days.reduce((acc, day) => {
          acc[day] = values.everyday;
          return acc;
        }, {});
      } else {
        workingHours = days.reduce((acc, day) => {
          acc[day] = values[day];
          return acc;
        }, {});
      }

      const response = await authenticatedFetch(`${import.meta.env.VITE_BASE_URL}/api/emp/clinic/${clinic_id}/schedule/settings/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ working_hours: workingHours }),
      });

      if (!response.ok) throw new Error('Failed to update working hours');

      toast({
        title: "Success",
        description: "Working hours updated successfully.",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update working hours. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Working Hours</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <p className="text-sm text-gray-500">Note: Time format should be in 24:00 hours</p>

            <div className="flex items-center space-x-2">
              <Switch
                checked={useEverydaySchedule}
                onCheckedChange={setUseEverydaySchedule}
              />
              <FormLabel>Use same schedule for every day</FormLabel>
            </div>

            {useEverydaySchedule ? (
              <div className="space-y-4">
                <h3 className="font-semibold mb-2">Every day</h3>
                {everydayFields.map((field, index) => (
                  <div key={field.id} className="flex space-x-2 mb-2">
                    <FormField
                      control={form.control}
                      name={`everyday.${index}.start`}
                      render={({ field }) => (
                        <FormItem>
                          <TimeSelect value={field.value} onChange={field.onChange} />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`everyday.${index}.end`}
                      render={({ field }) => (
                        <FormItem>
                          <TimeSelect value={field.value} onChange={field.onChange} />
                        </FormItem>
                      )}
                    />
                    <Button type="button" variant="outline" onClick={() => removeEveryday(index)}>Remove</Button>
                  </div>
                ))}
                <Button type="button" onClick={() => appendEveryday({ start: '', end: '' })}>Add Time Slot</Button>
              </div>
            ) : (
              days.map(day => (
                <div key={day} className="space-y-4">
                  <h3 className="font-semibold mb-2 capitalize">{day}</h3>
                  {dayFields[day].map((field, index) => (
                    <div key={field.id} className="flex space-x-2 mb-2">
                      <FormField
                        control={form.control}
                        name={`${day}.${index}.start`}
                        render={({ field }) => (
                          <FormItem>
                            <TimeSelect value={field.value} onChange={field.onChange} />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`${day}.${index}.end`}
                        render={({ field }) => (
                          <FormItem>
                            <TimeSelect value={field.value} onChange={field.onChange} />
                          </FormItem>
                        )}
                      />
                      <Button type="button" variant="outline" onClick={() => dayRemove[day](index)}>Remove</Button>
                    </div>
                  ))}
                  <Button type="button" onClick={() => dayAppend[day]({ start: '', end: '' })}>Add Time Slot</Button>
                </div>
              ))
            )}

            <Button type="submit" className="w-full">
              Update Settings
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default WorkingHours;