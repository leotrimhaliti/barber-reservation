import React, { useState } from 'react';
import { Calendar, Clock, User, Check, Mail, Phone, Loader2 } from 'lucide-react'; 

interface BookingConfirmationProps {
  selectedDate: Date;
  selectedTime: string;
  onConfirm: (clientName: string, phoneNumber: string) => void; 
  onCancel: () => void;
  isSaving: boolean; 
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  selectedDate,
  selectedTime,
  onConfirm,
  onCancel,
  isSaving,
}) => {
  const [clientName, setClientName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(''); 
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('sq-AL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleConfirmClick = () => {
      if (clientName.trim() && phoneNumber.trim()) {
          onConfirm(clientName.trim(), phoneNumber.trim()); 
      } else {
          alert("Ju lutem plotësoni Emrin dhe Numrin e Telefonit!");
      }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-gray-700" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Konfirmoni rezervimin
        </h3>
        <p className="text-gray-600">
          Ju lutem plotësoni emrin dhe numrin e telefonit
        </p>
      </div>
      
      {/* Formulari i ri */}
      <div className="space-y-4 mb-6">
         <div>
            <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 mb-1">
                Emri dhe Mbiemri
            </label>
            <div className="relative">
                <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                    id="clientName"
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Emri juaj i plotë"
                    required
                    className="w-full py-3 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-gray-800 focus:border-gray-800 transition"
                    disabled={isSaving}
                />
            </div>
         </div>
         
         <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Numri i Telefonit
            </label>
            <div className="relative">
                <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                    id="phoneNumber"
                    type="tel" // Përdor tel për formatin e telefonit
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="P.sh. +383 44 123 456"
                    required
                    className="w-full py-3 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-gray-800 focus:border-gray-800 transition"
                    disabled={isSaving}
                />
            </div>
         </div>
         
        {/* Detajet e rezervimit */}
        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
          <Calendar className="w-5 h-5 text-gray-700 mr-3" />
          <div>
            <p className="text-sm text-gray-500">Data</p>
            <p className="font-medium text-gray-800">{formatDate(selectedDate)}</p>
          </div>
        </div>

        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
          <Clock className="w-5 h-5 text-gray-700 mr-3" />
          <div>
            <p className="text-sm text-gray-500">Ora</p>
            <p className="font-medium text-gray-800">{selectedTime}</p>
          </div>
        </div>

        {/* Shërbimi */}
        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
          <Mail className="w-5 h-5 text-gray-700 mr-3" />
          <div>
            <p className="text-sm text-gray-500">Shërbimi</p>
            <p className="font-medium text-gray-800">Qethje flokësh (Barber)</p>
          </div>
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={onCancel}
          disabled={isSaving}
          className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Anulo
        </button>
        <button
          onClick={handleConfirmClick}
          disabled={!clientName.trim() || !phoneNumber.trim() || isSaving} 
          className="flex-1 py-3 px-4 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-900 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isSaving ? (
            <Loader2 className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" />
          ) : (
            <Check className="w-5 h-5 mr-2" />
          )}
          {isSaving ? 'Duke ruajtur...' : 'Konfirmo Rezervimin'}
        </button>
      </div>
    </div>
  );
};

export default BookingConfirmation;