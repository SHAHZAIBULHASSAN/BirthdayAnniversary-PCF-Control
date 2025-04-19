import * as React from 'react';
import { IInputs } from '../generated/ManifestTypes';

interface EventProps {
  dateOfBirth: Date;
  joiningDate: Date;
}

const EventCard: React.FC<EventProps> = ({ dateOfBirth, joiningDate }) => {
  const today = new Date();

  // Function to calculate the next occurrence of an event
  const getNextOccurrence = (date: Date, today: Date): Date => {
    const currentYear = today.getFullYear();
    const occurrenceThisYear = new Date(currentYear, date.getMonth(), date.getDate());

    if (occurrenceThisYear < today) {
      return new Date(currentYear + 1, date.getMonth(), date.getDate());
    }
    return occurrenceThisYear;
  };

  // Function to calculate age or years worked
  const calculateYears = (startDate: Date, endDate: Date): number => {
    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();
    const yearDifference = endYear - startYear;

    if (
      endDate.getMonth() < startDate.getMonth() ||
      (endDate.getMonth() === startDate.getMonth() && endDate.getDate() < startDate.getDate())
    ) {
      return yearDifference - 1;
    }
    return yearDifference;
  };

  const isUpcoming = (eventDate: Date, daysThreshold: number): boolean => {
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= daysThreshold && diffDays >= 0;
  };

  const nextBirthday = getNextOccurrence(dateOfBirth, today);
  const nextAnniversary = getNextOccurrence(joiningDate, today);

  const age = calculateYears(dateOfBirth, today);
  const yearsWorked = calculateYears(joiningDate, today);

  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString(undefined, options);
  };

  const generateICSFile = (eventName: string, eventDate: Date): void => {
    const icsContent = `
BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${eventName}
DTSTART:${eventDate.toISOString().replace(/-|:|\.\d+/g, '')}
END:VEVENT
END:VCALENDAR
`;

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${eventName}.ics`;
    link.click();
  };

  return (
    <div className="card" role="region" aria-label="Upcoming Events">
      <div className="header">
        <h3>Upcoming Events</h3>
      </div>
      <div className="content">
        <div className={`event-item ${isUpcoming(nextBirthday, 7) ? 'upcoming' : ''}`}>
          <span className="icon">🎉</span>
          <div className="details">
            <p className="label">Next Birthday:</p>
            <p className="date">{formatDate(nextBirthday)}</p>
            <p className="additional-info">Age: {age} years</p>
            <button onClick={() => generateICSFile("Next Birthday", nextBirthday)}>Add to Calendar</button>
          </div>
          {isUpcoming(nextBirthday, 7) && <span className="notification-badge">❗</span>}
        </div>
        <div className={`event-item ${isUpcoming(nextAnniversary, 7) ? 'upcoming' : ''}`}>
          <span className="icon">🏆</span>
          <div className="details">
            <p className="label">Next Work Anniversary:</p>
            <p className="date">{formatDate(nextAnniversary)}</p>
            <p className="additional-info">Years Worked: {yearsWorked} years</p>
            <button onClick={() => generateICSFile("Next Work Anniversary", nextAnniversary)}>Add to Calendar</button>
          </div>
          {isUpcoming(nextAnniversary, 7) && <span className="notification-badge">❗</span>}
        </div>
      </div>
    </div>
  );
};

export default EventCard;