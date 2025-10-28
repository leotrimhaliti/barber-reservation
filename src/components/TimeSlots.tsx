import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from './supabaseClient';

interface TimeSlotsProps {
  selectedDate: Date;
  selectedTime: string | null;
  onTimeSelect: (time: string) => void;
  isAdmin?: boolean;
  onAdminReserve?: (time: string, date: Date) => void;
  refreshTrigger?: number;
}

const TimeSlots: React.FC<TimeSlotsProps> = ({
  selectedDate,
  selectedTime,
  onTimeSelect,
  isAdmin = false,
  onAdminReserve,
  refreshTrigger,
}) => {
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const generateTimeSlots = (): string[] => {
    const slots: string[] = [];
    const startHour = 9;
    const endHour = 20;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute
          .toString()
          .padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const weekdays = [
    'E Diel',
    'E Hënë',
    'E Martë',
    'E Mërkurë',
    'E Enjte',
    'E Premte',
    'E Shtunë',
  ];
  const months = [
    'Janar',
    'Shkurt',
    'Mars',
    'Prill',
    'Maj',
    'Qershor',
    'Korrik',
    'Gusht',
    'Shtator',
    'Tetor',
    'Nëntor',
    'Dhjetor',
  ];

  const formatDateShqip = (date: Date) => {
    const dayName = weekdays[date.getDay()];
    const day = date.getDate();
    const monthName = months[date.getMonth()];
    const year = date.getFullYear();
    return `${dayName}, ${day} ${monthName} ${year}`;
  };

  const isSunday = selectedDate.getDay() === 0;

  const fetchBookedSlots = async () => {
    if (isSunday) {
      setBookedSlots(timeSlots);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const dateQuery = selectedDate.toISOString().split('T')[0];

    // Nuk ka filtër për is_completed këtu, kështu që kthen të gjitha rezervimet, siç duhet.
    const { data, error } = await supabase
      .from('bookings')
      .select('time_slot')
      .eq('date', dateQuery);

    if (error) {
      console.error('Gabim gjatë marrjes së orareve të zëna:', error);
      setBookedSlots([]);
    } else if (data) {
      const slots = data.map(
        (booking: { time_slot: string }) => booking.time_slot
      );
      setBookedSlots(slots);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchBookedSlots();
  }, [selectedDate, refreshTrigger]);

  const isBooked = (time: string): boolean => bookedSlots.includes(time);

  const isPastTime = (selectedDate: Date, selectedTime: string) => {
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const now = new Date();
    const dateCopy = new Date(selectedDate);
    dateCopy.setHours(hours, minutes, 0, 0);
    return dateCopy < now;
  };

  const isToday = (date: Date) => {
    const now = new Date();
    return (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  };

  const isPastDate =
    selectedDate.setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md h-full">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <Clock className="w-5 h-5 mr-2" />
        Zgjidhni orarin
      </h3>

      {isLoading && !isSunday ? (
        <div className="flex items-center justify-center h-48 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Duke ngarkuar oraret...
        </div>
      ) : isPastDate ? (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg text-center font-medium">
          Kjo datë ka kaluar.
        </div>
      ) : isSunday ? (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg text-center font-medium">
          Sot jemi të mbyllur. Ju lutem zgjidhni një ditë tjetër.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto pr-2">
          {timeSlots.map((time) => {
            const booked = isBooked(time);
            const isSelected = selectedTime === time;
            const past = isToday(selectedDate) && isPastTime(selectedDate, time); // Logjika e re

            // BLLOKU I RREGULLUAR PËR ADMIN
            if (isAdmin) {
              return (
                <button
                  key={time}
                  onClick={() => {
                    // Lejohet shtimi vetëm nëse nuk është zënë OSE nuk është orar i kaluar
                    if (!booked && !past && onAdminReserve) onAdminReserve(time, selectedDate);
                  }}
                  disabled={booked || past} // Butoni është disabled nëse është zënë ose ka kaluar koha
                  className={`
                    p-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center
                    ${booked
                      ? 'bg-red-100 text-red-600 cursor-not-allowed opacity-75 flex-col'
                      : past
                      ? 'bg-red-200 text-red-700 cursor-not-allowed opacity-70' // Orari i kaluar
                      : 'bg-green-100 text-green-700 hover:bg-green-200 hover:scale-105 shadow-md'
                    }
                  `}
                >
                  {booked ? (
                    <div className="flex flex-col items-center space-y-1">
                      <div className="flex items-center">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {time}
                      </div>
                      <span className="text-xs text-red-500 font-normal">
                        E Zënë
                      </span>
                    </div>
                  ) : past ? (
                    <div className="flex flex-col items-center space-y-1 text-red-700">
                      <span className="font-semibold">{time}</span>
                      <span className="text-xs font-normal">Ka Kalur</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-1">
                      <span className="font-semibold">{time}</span>
                      <span className="text-xs font-normal">Shto Rezervim</span>
                    </div>
                  )}
                </button>
              );
            }
            // FUNDI I BLLOKUT TË ADMIN

            // BLLOKU PËR KLIENTËT E RREGULLT
            return (
              <button
                key={time}
                onClick={() => !booked && !isSunday && !past && onTimeSelect(time)}
                disabled={booked || isSunday || past}
                className={`
                  p-3 text-sm rounded-lg font-medium transition-all duration-200 flex items-center justify-center
                  ${
                    booked || isSunday
                      ? 'bg-red-100 text-red-600 cursor-not-allowed opacity-75 flex-col'
                      : past
                      ? 'bg-red-200 text-red-700 cursor-not-allowed opacity-70'
                      : isSelected
                      ? 'bg-gray-800 text-white shadow-lg transform scale-105'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-gray-800 hover:scale-105'
                  }
                `}
              >
                {booked ? (
                  <div className="flex flex-col items-center space-y-1">
                    <div className="flex items-center">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {time}
                    </div>
                    <span className="text-xs text-red-500 font-normal">
                      E Zënë
                    </span>
                  </div>
                ) : past ? (
                   <div className="flex flex-col items-center space-y-1 text-red-700">
                      <span className="font-semibold">{time}</span>
                      <span className="text-xs font-normal">Ka Kalur</span>
                    </div>
                ) : (
                  time
                )}
              </button>
            );
          })}
        </div>
      )}

      {selectedTime && !isAdmin && !isSunday && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-gray-800 font-medium">
            Ora e zgjedhur: {selectedTime} - {formatDateShqip(selectedDate)}
          </p>
        </div>
      )}
    </div>
  );
};

export default TimeSlots;