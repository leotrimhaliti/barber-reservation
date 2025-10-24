import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, Loader2 } from 'lucide-react'; // Tani Loader2 është importuar
import { supabase } from './supabaseClient'; 

interface TimeSlotsProps {
  selectedDate: Date;
  selectedTime: string | null;
  onTimeSelect: (time: string) => void;
  isAdmin?: boolean; 
  onAdminReserve?: (time: string, date: Date) => void; 
  refreshTrigger?: number; // Përdoret për rifreskimin nga AdminDashboard
}

const TimeSlots: React.FC<TimeSlotsProps> = ({
  selectedDate,
  selectedTime,
  onTimeSelect,
  isAdmin = false,
  onAdminReserve,
  refreshTrigger,
}) => {
  // State-të për të mbajtur oraret e zëna dhe statusin e ngarkimit
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true); 

  /**
   * Gjeneron listën e të gjitha orareve të mundshme (09:00 - 19:30).
   */
  const generateTimeSlots = (): string[] => {
    const slots: string[] = [];
    const startHour = 9;
    const endHour = 20;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('sq-AL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  // KONTROLLI I RI: Kontrollo nëse dita e zgjedhur është e Dielë (0)
  const isSunday = selectedDate.getDay() === 0;

  const fetchBookedSlots = async () => {
    // NUK KA NEVOJË TË THËRRITET DATABAZA NËSE ËSHTË E DIEL
    if (isSunday) {
        setBookedSlots(timeSlots); // Bëj të gjitha oraret të zëna (logjikisht)
        setIsLoading(false);
        return;
    }
    
    setIsLoading(true);
    // Konverto selectedDate në formatin 'YYYY-MM-DD'
    const dateQuery = selectedDate.toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('bookings') 
      .select('time_slot')
      .eq('date', dateQuery); // Filtro sipas datës së zgjedhur

    if (error) {
      console.error('Gabim gjatë marrjes së orareve të zëna:', error);
      setBookedSlots([]);
    } else if (data) {
      // Kthe data.time_slot në një listë të thjeshtë stringash
      const slots = data.map((booking: { time_slot: string }) => booking.time_slot);
      setBookedSlots(slots);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    // RIFRESKIMI AUTOMATIK: Thërritet kur ndryshon selectedDate OSE refreshTrigger
    fetchBookedSlots();
  }, [selectedDate, refreshTrigger]); 
  
  // Kontrollon nëse një orar është i zënë (përfshin Dielën falë logjikës së fetchBookedSlots)
  const isBooked = (time: string): boolean => bookedSlots.includes(time);
  
  // Kontrollon nëse data është në të kaluarën
  const isPastDate = selectedDate.setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);

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
        // NDYSHIMI: Boks i vogël, jo-aktiv, si ditët e kaluara
        <div className="p-4 bg-red-100 text-red-700 rounded-lg text-center font-medium">
            Sot jemi të mbyllur. Ju lutem zgjidhni një ditë tjetër.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto pr-2">
          {timeSlots.map((time) => {
            const booked = isBooked(time);
            const isSelected = selectedTime === time;

            // Kontrolli për adminin
            if (isAdmin) {
                return (
                  <button
                    key={time}
                    onClick={() => {
                      // Edhe për adminin, nuk lejohet rezervimi në orare të zëna/Diel
                      if (!booked && onAdminReserve) {
                        onAdminReserve(time, selectedDate);
                      }
                    }}
                    // Edhe admini e ka disabled (por në fakt booked = true nëse është e Diel)
                    className={`
                      p-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center
                      ${booked
                        ? 'bg-red-100 text-red-600 cursor-not-allowed opacity-75 flex-col'
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
                          {isSunday ? 'E Mbyllur' : 'E Zënë'}
                        </span>
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
            
            // Për Klientët (Default)
            return (
              <button
                key={time}
                // Klikohet vetëm nëse nuk është i zënë DHE NUK ËSHTË E DIEL (isSunday)
                onClick={() => !booked && !isSunday && onTimeSelect(time)}
                // Butoni është i bllokuar nëse orari është i zënë ose nëse dita është e Diel
                disabled={booked || isSunday} 
                className={`
                  p-3 text-sm rounded-lg font-medium transition-all duration-200 flex items-center justify-center
                  ${booked || isSunday // Klasat e kuqe aplikohen nëse booked OR isSunday
                    ? 'bg-red-100 text-red-600 cursor-not-allowed opacity-75 flex-col'
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
                    {/* Ky tekst do të shfaqet 'E Zënë' edhe për Dielën */}
                    <span className="text-xs text-red-500 font-normal">E Zënë</span> 
                  </div>
                ) : (
                  time
                )}
              </button>
            );
          })}
        </div>
      )}

      {selectedTime && !isAdmin && !isSunday && ( // Mos e shfaq nëse është admin ose e Diel
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-gray-800 font-medium">
            Ora e zgjedhur: {selectedTime} - {formatDate(selectedDate)}
          </p>
        </div>
      )}
    </div>
  );
};

export default TimeSlots;