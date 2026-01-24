'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, MapPin, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface TimeSlot {
  time: string;
  available: boolean;
}

const timeSlots: TimeSlot[] = [
  { time: '08:00', available: true },
  { time: '09:00', available: true },
  { time: '10:00', available: false },
  { time: '11:00', available: true },
  { time: '12:00', available: true },
  { time: '13:00', available: false },
  { time: '14:00', available: true },
  { time: '15:00', available: true },
];

export function CleanlyBookingCalendar() {
  const [selectedTime, setSelectedTime] = useState<string>();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Book Your Cleaning Service
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>123 Main St, New York, NY</span>
            </div>

            <div className="grid gap-2">
              <h3 className="font-medium">Available Times</h3>
              <div className="grid grid-cols-2 gap-2">
                {timeSlots.map((slot) => (
                  <Button
                    key={slot.time}
                    variant={selectedTime === slot.time ? 'default' : 'outline'}
                    disabled={!slot.available}
                    onClick={() => slot.available && setSelectedTime(slot.time)}
                    className="justify-start"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    {slot.time}
                  </Button>
                ))}
              </div>
            </div>

            {selectedTime && (
              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <p className="text-green-800 dark:text-green-200">
                  Selected: {selectedTime} - Standard Cleaning ($89)
                </p>
                <Button className="w-full mt-3 bg-green-600 hover:bg-green-700">
                  Book Now
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
