import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  currentDate: Date;
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  onMonthChange: (direction: 'prev' | 'next') => void;
}

const Calendar: React.FC<CalendarProps> = ({
  currentDate,
  selectedDate,
  onDateSelect,
  onMonthChange,
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startOfCalendar = new Date(startOfMonth);
  startOfCalendar.setDate(startOfCalendar.getDate() - startOfCalendar.getDay());

  const days = [];
  const currentCalendarDate = new Date(startOfCalendar);

  // Generate 42 days (6 weeks)
  for (let i = 0; i < 42; i++) {
    days.push(new Date(currentCalendarDate));
    currentCalendarDate.setDate(currentCalendarDate.getDate() + 1);
  }

  const monthNames = [
    'Janar', 'Shkurt', 'Mars', 'Prill', 'Maj', 'Qershor',
    'Korrik', 'Gusht', 'Shtator', 'Tetor', 'Nëntor', 'Dhjetor'
  ];

  // KORRIGJIMI: Diell (e Diel)
  const dayNames = ['Diell', 'Hën', 'Mar', 'Mër', 'Enj', 'Pre', 'Sht'];

  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const isPastDate = (date: Date) => {
    return date < today;
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => onMonthChange('prev')}
          className="p-2 rounded-full hover:bg-gray-100"
          aria-label="Muaji i mëparshëm"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-xl font-bold text-gray-800">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <button
          onClick={() => onMonthChange('next')}
          className="p-2 rounded-full hover:bg-gray-100"
          aria-label="Muaji tjetër"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          const isPast = isPastDate(date);
          const isCurrentMonthDate = isCurrentMonth(date);
          const isSelectedDate = isSelected(date);
          
          // NDYSHIMI I RI PËR TË DIELËN (0 = Sunday)
          const isSunday = date.getDay() === 0;

          // Vlera boolean e kombinuar për çaktivizim
          // Është e çaktivizuar nëse është në të kaluarën OSE jashtë muajit aktual OSE është e Diel
          const isDisabled = isPast || !isCurrentMonthDate || isSunday; 

          return (
            <button
              key={index}
              // Kliko vetëm nëse nuk është e çaktivizuar
              onClick={() => !isDisabled && onDateSelect(date)}
              disabled={isDisabled}
              className={`
                p-3 text-sm rounded-lg transition-all duration-200 hover:scale-105
                ${isSunday // 1. PRIORI I LARTË PËR TË DIELËN: Kuqe + E Çaktivizuar
                  ? 'text-red-400 bg-red-50 cursor-not-allowed' 
                  : isPast // 2. Ditët e kaluara (në muajin aktual): Kuqe + E Çaktivizuar
                    ? 'text-red-400 bg-red-50 cursor-not-allowed'
                    : isCurrentMonthDate // 3. Ditët në muajin aktual, jo të kaluara dhe jo të diela
                      ? isSelectedDate
                        ? 'bg-gray-800 text-white shadow-lg'
                        : 'text-gray-800 hover:bg-gray-50 hover:text-gray-700 cursor-pointer'
                      : 'text-gray-300 cursor-not-allowed' // 4. Ditët jashtë muajit aktual: Të çaktivizuara, por stili origjinal gri
                }
                ${!isCurrentMonthDate && 'opacity-30'}
              `}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;