import React, { useState } from 'react';
import { Scissors, Calendar as CalendarIcon, Clock, Check } from 'lucide-react';
import Calendar from './components/Calendar';
import TimeSlots from './components/TimeSlots';
import BookingConfirmation from './components/BookingConfirmation';
import { supabase } from './components/supabaseClient'; 

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [step, setStep] = useState<'calendar' | 'time' | 'confirmation' | 'success'>('calendar');
  
  const [isSaving, setIsSaving] = useState(false); 
  
  /**
   * FUNKSIONI PËR INSERT NË SUPABASE
   */
  const handleConfirmBooking = async (clientName: string, phoneNumber: string) => { 
    if (!selectedDate || !selectedTime || !clientName.trim() || !phoneNumber.trim()) return;

    setIsSaving(true);
    
    // Konverto selectedDate në formatin 'YYYY-MM-DD'
    const dateToInsert = selectedDate.toISOString().split('T')[0];

    const newBookingData = {
      date: dateToInsert,
      time_slot: selectedTime,
      client_name: clientName, 
      client_phone: phoneNumber, 
      service_type: 'Qethje flokësh (Barber)', 
    };

    const { error } = await supabase
      .from('bookings') 
      .insert([newBookingData]);
      
    setIsSaving(false);

    if (error) {
      console.error('Gabim gjatë rezervimit:', error.message);
      alert(`Gabim gjatë rezervimit: ${error.message}. Ju lutem provoni përsëri.`);
    } else {
      setStep('success');
      
      // Pas 3 sekondave, kthehu te kalendari dhe bëj reset state-in
      setTimeout(() => {
        setStep('calendar');
        setSelectedDate(null);
        setSelectedTime(null);
      }, 3000);
    }
  };


  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setStep('time');
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep('confirmation');
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleCancelBooking = () => {
    setStep('time');
  };

  const resetToCalendar = () => {
    setStep('calendar');
    setSelectedDate(null);
    setSelectedTime(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Scissors className="w-10 h-10 text-gray-800"/>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">VikiBarber</h1>
          <p className="text-gray-600 text-lg">Rezervoni terminin tuaj online</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center ${step !== 'calendar' ? 'text-gray-800' : 'text-gray-800'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step !== 'calendar' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                <CalendarIcon className="w-5 h-5" />
              </div>
              <span className="ml-2 font-medium">Data</span>
            </div>
            
            <div className={`w-8 h-0.5 ${step === 'confirmation' || step === 'success' || step === 'time' ? 'bg-gray-800' : 'bg-gray-300'}`}></div>
            
            <div className={`flex items-center ${step === 'time' || step === 'confirmation' || step === 'success' ? 'text-gray-800' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step === 'time' || step === 'confirmation' || step === 'success' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                <Clock className="w-5 h-5" />
              </div>
              <span className="ml-2 font-medium">Ora</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {step === 'calendar' && (
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <Calendar
                  currentDate={currentDate}
                  selectedDate={selectedDate}
                  onDateSelect={handleDateSelect}
                  onMonthChange={handleMonthChange}
                />
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Informacione</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-2">Orari i punës</h4>
                    <p className="text-gray-600 text-sm">E Hënë - E Shtunë: 08:00 - 20:00</p>
                    <p className="text-gray-600 text-sm">E Diel: Mbyllur</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">Shërbimet</h4>
                    <ul className="text-green-600 text-sm space-y-1">
                      <li>• Qethje flokësh</li>
                      <li>• Rregullim mjekre</li>
                      <li>• Larje flokësh</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h4 className="font-medium text-yellow-800 mb-2">Kohëzgjatja</h4>
                    <p className="text-yellow-600 text-sm">Çdo termin: 30 minuta</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'time' && selectedDate && (
            <div className="space-y-6">
              <button
                onClick={resetToCalendar}
                className="text-gray-700 hover:text-gray-800 font-medium flex items-center"
              >
                ← Kthehu te kalendari
              </button>
              <TimeSlots
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                onTimeSelect={handleTimeSelect}
                isAdmin={false} // Klienti nuk është admin
              />
            </div>
          )}

          {step === 'confirmation' && selectedDate && selectedTime && (
            <div className="space-y-6">
              <button
                onClick={() => setStep('time')}
                className="text-gray-700 hover:text-gray-800 font-medium flex items-center"
              >
                ← Kthehu te oraret
              </button>
              <BookingConfirmation
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                onConfirm={handleConfirmBooking} 
                onCancel={handleCancelBooking}
                isSaving={isSaving} 
              />
            </div>
          )}

          {step === 'success' && (
            <div className="text-center">
              <div className="bg-white p-8 rounded-xl shadow-lg max-w-md mx-auto">
                 <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="w-10 h-10 text-green-700" />
                 </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  Rezervimi u konfirmua!
                </h3>
                <p className="text-gray-600 mb-6">
                </p>
                <div className="w-full h-1 bg-green-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-full animate-pulse"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;