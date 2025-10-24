import React, { useState, useEffect } from 'react';
import { Trash2, Calendar as CalendarIcon, Clock, User, Phone, Loader2, LogOut, Shield, X } from 'lucide-react';
import { supabase } from './supabaseClient';
import Auth from './Auth'; 
import Calendar from './Calendar'; 
import TimeSlots from './TimeSlots'; 

interface Booking {
  id: number;
  date: string;
  time_slot: string;
  client_name: string;
  client_phone: string;
  service_type: string;
  created_at: string;
}

const AdminDashboard: React.FC = () => {
  const [session, setSession] = useState<any>(null); 
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false); 

  // State per Kalendarin
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  // STATE E RE PER REZERVIM MANUAL
  const [isManualBookingOpen, setIsManualBookingOpen] = useState(false);
  const [manualBookingData, setManualBookingData] = useState({
    date: new Date(),
    time: '',
    clientName: '',
    phoneNumber: '',
  });
  const [isSavingManual, setIsSavingManual] = useState(false);
  
  // SHTESA E RE: Për të detektuar rifreskimin në TimeSlots
  const [refreshTimeSlots, setRefreshTimeSlots] = useState(0); 

  // Marrja e Profilit per te kontrolluar isAdmin
  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .single();
    
    if (!error && data) {
        setIsAdmin(data.is_admin);
        if (data.is_admin) {
            fetchBookings(); 
        } else {
            setIsLoading(false);
            setError('Nuk keni të drejta administrimi. Llogaria juaj nuk është e shënuar si "admin".');
        }
    } else {
        setIsLoading(false);
        setError('Gabim gjatë marrjes së profilit. Sigurohu që tabela "profiles" ekziston dhe RLS është korrekt.');
    }
  }


  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session) {
          fetchProfile(session.user.id);
        } else {
          setIsAdmin(false);
          setIsLoading(false);
          setBookings([]);
        }
      }
    );

    return () => {
        authListener?.subscription.unsubscribe();
    };
  }, []);

  const fetchBookings = async () => {
    setIsLoading(true);
    setError(null);
    
    let query = supabase
      .from('bookings')
      .select('*')
      .order('date', { ascending: true })
      .order('time_slot', { ascending: true });
      
    if (selectedDate) {
        const dateQuery = selectedDate.toISOString().split('T')[0];
        query = query.eq('date', dateQuery);
    }
      
    const { data, error } = await query;

    if (error) {
      console.error('Gabim gjatë marrjes së rezervimeve:', error);
      setError('Gabim. Kontrolloni RLS për SELECT në tabelën "bookings".');
      setBookings([]);
    } else if (data) {
      setBookings(data as Booking[]);
    }
    setIsLoading(false);
  };
  
  useEffect(() => {
    if (session && isAdmin) {
        fetchBookings();
    }
  }, [selectedDate, session, isAdmin]); 
  
  
  const handleDeleteBooking = async (bookingId: number) => {
    if (!session || !isAdmin) return; 

    if (!window.confirm("A jeni i sigurt që dëshironi të fshini këtë rezervim?")) {
      return;
    }

    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', bookingId); 

    if (error) {
      console.error('Gabim gjatë fshirjes:', error);
      alert(`Gabim gjatë fshirjes: ${error.message}`);
    } else {
      // Zëvendësojme rifreskimin me setBookings direkt
      setBookings(prev => prev.filter(booking => booking.id !== bookingId));
      // Trigger rifreskimin e TimeSlots
      setRefreshTimeSlots(prev => prev + 1);
    }
  };
  
  const handleLogout = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
  }
  
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null); 
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
  
  // 1. Thirrje kur Admini klikon orarin e lirë (nga TimeSlots)
  const handleAdminReserve = (time: string, date: Date) => {
    setManualBookingData({
        date: date,
        time: time,
        clientName: '',
        phoneNumber: '',
    });
    setIsManualBookingOpen(true);
  };
  
  // 2. Funksioni për ruajtjen në databazë (I PËRDITËSUAR)
  const saveManualBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualBookingData.clientName.trim() || !manualBookingData.phoneNumber.trim()) {
        alert("Emri i klientit dhe telefoni janë të detyrueshëm.");
        return;
    }
    
    setIsSavingManual(true);
    
    const dateToInsert = manualBookingData.date.toISOString().split('T')[0];

    const newBookingData = {
      date: dateToInsert,
      time_slot: manualBookingData.time,
      client_name: manualBookingData.clientName.trim(), 
      client_phone: manualBookingData.phoneNumber.trim(), 
      service_type: 'Qethje flokësh (Barber)', 
    };

    const { error } = await supabase
      .from('bookings') 
      .insert([newBookingData]);
      
    setIsSavingManual(false);

    if (error) {
      // HEQET console.error, ruhet vetëm alerti
      alert(`Gabim gjatë rezervimit: ${error.message}`);
    } else {
      alert(`Rezervimi për ${manualBookingData.clientName} në ${manualBookingData.time} u shtua!`);
      setIsManualBookingOpen(false);
      
      // RIFRESKIMI DIREKT PËR LISTËN E REZERVIMEVE TË ADMIN DASHBOARDIT
      fetchBookings(); 
      
      // SHTESA E RE: TRIGGER PËR RIFRESKIMIN E TimeSlots
      setRefreshTimeSlots(prev => prev + 1);
    }
  };


  if (isLoading && !session) {
       return (
          <div className="flex items-center justify-center min-h-screen bg-gray-50">
             <Loader2 className="w-8 h-8 animate-spin text-gray-800 mr-2" />
             Duke kontrolluar statusin e administratorit...
          </div>
       );
    }

  if (!session || !isAdmin) {
    if (session && !isAdmin) {
         return (
             <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 p-4">
                 <Shield className="w-16 h-16 text-red-500 mb-4" />
                 <h2 className="text-2xl font-bold text-red-800 mb-2">Qasje e Kufizuar</h2>
                 <p className="text-red-600 mb-6">Nuk jeni i autorizuar si administrator.</p>
                 <button
                    onClick={handleLogout}
                    className="p-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center"
                 >
                    <LogOut className="w-5 h-5 mr-2" />
                    Dilni nga llogaria
                 </button>
             </div>
         );
    }
    return <Auth />; 
  }
  
  // Dashboardi i Adminit
  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6 border-b pb-3">
            <h1 className="text-3xl font-bold text-gray-800">
                <Shield className="w-6 h-6 inline mr-2 text-gray-600"/>
                Paneli i Administratorit
            </h1>
            <button
              onClick={handleLogout}
              className="p-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors flex items-center"
              disabled={isLoading}
            >
              <LogOut className="w-5 h-5 mr-2" />
              Dil (Logout)
            </button>
        </div>
        
        {/* Kontrolli i Data/Orarit */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
            <Calendar
                currentDate={currentDate}
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
                onMonthChange={handleMonthChange}
            />
            <TimeSlots
                selectedDate={selectedDate || new Date()}
                selectedTime={selectedTime}
                onTimeSelect={(time) => setSelectedTime(time)}
                isAdmin={true} 
                onAdminReserve={handleAdminReserve}
                refreshTrigger={refreshTimeSlots} // PROP I RI
            />
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
            Rezervimet për: {selectedDate?.toLocaleDateString('sq-AL', { weekday: 'long', month: 'long', day: 'numeric' })}
        </h2>

        {isLoading && (
            <div className="flex items-center justify-center p-8 bg-white rounded-xl mb-4">
                <Loader2 className="w-5 h-5 animate-spin text-gray-800 mr-2" />
                Duke rifreskuar rezervimet...
            </div>
        )}

        {error && (
             <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-4">{error}</div>
        )}

        {bookings.length === 0 && !isLoading ? (
          <div className="p-10 text-center bg-white rounded-xl shadow-md">
            <h3 className="text-xl text-gray-600">Nuk ka rezervime për këtë datë.</h3>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white p-5 rounded-xl shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center transition-all hover:ring-2 hover:ring-gray-300"
              >
                <div className="flex-1 space-y-2 mb-4 sm:mb-0">
                  <div className="flex items-center space-x-4 text-gray-700">
                    <Clock className="w-5 h-5 flex-shrink-0" />
                    <span className="font-semibold text-xl text-gray-800">{booking.time_slot}</span>
                  </div>
                  
                  <div className="flex flex-wrap items-center space-x-4 text-gray-600 text-sm mt-2">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Klienti: <span className="font-medium ml-1">{booking.client_name}</span>
                    </div>
                    <div className="flex items-center ml-4">
                      <Phone className="w-4 h-4 mr-2" />
                      Tel: <span className="font-medium ml-1">{booking.client_phone}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 pt-1">Rezervuar: {new Date(booking.created_at).toLocaleString('sq-AL')}</p>
                </div>

                <button
                  onClick={() => handleDeleteBooking(booking.id)}
                  className="p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center shadow-md w-full sm:w-auto justify-center"
                  disabled={isLoading}
                >
                  <Trash2 className="w-5 h-5" />
                  <span className="ml-2">Fshij</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL PËR REZERVIM MANUAL (SHTIMI I KLIENTIT) */}
      {isManualBookingOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <form 
              onSubmit={saveManualBooking} 
              className="bg-white p-8 rounded-xl shadow-2xl max-w-lg w-full relative"
          >
            <button
              type="button"
              onClick={() => setIsManualBookingOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h4 className="text-2xl font-bold text-gray-800 border-b pb-3 mb-6">
                Rezervim i Ri Manual
            </h4>
            
            <div className="space-y-4 mb-6">
                <p className="text-lg font-medium text-gray-700 p-3 bg-blue-50 rounded-lg">
                    <CalendarIcon className="w-5 h-5 inline mr-2 text-blue-600"/>
                    Data: {manualBookingData.date.toLocaleDateString('sq-AL', { month: 'long', day: 'numeric' })} në <Clock className="w-5 h-5 inline mr-1 text-blue-600"/> {manualBookingData.time}
                </p>

                <div>
                    <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 mb-1">Emri i Klientit</label>
                    <input
                        id="clientName"
                        type="text"
                        value={manualBookingData.clientName}
                        onChange={(e) => setManualBookingData({...manualBookingData, clientName: e.target.value})}
                        placeholder="Emri i klientit"
                        required
                        className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-gray-800 focus:border-gray-800"
                        disabled={isSavingManual}
                    />
                </div>
                
                <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">Numri i Telefonit</label>
                    <input
                        id="phoneNumber"
                        type="tel"
                        value={manualBookingData.phoneNumber}
                        onChange={(e) => setManualBookingData({...manualBookingData, phoneNumber: e.target.value})}
                        placeholder="Numri i telefonit"
                        required
                        className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-gray-800 focus:border-gray-800"
                        disabled={isSavingManual}
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={isSavingManual || !manualBookingData.clientName.trim() || !manualBookingData.phoneNumber.trim()}
                className="w-full py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
                {isSavingManual && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
                {isSavingManual ? 'Duke ruajtur...' : 'Shto Klientin Tani'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;