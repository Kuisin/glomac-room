import { format } from 'date-fns';
import moment from 'moment-timezone';

// Convert a date string to Japan timezone timestamp
export const toJapanTimestamp = (dateStr: string, timeStr: string): Date => {
  const japanTime = moment.tz(`${dateStr} ${timeStr}`, 'YYYY-MM-DD HH:mm', 'Asia/Tokyo');
  return japanTime.toDate();
};

// Format a timestamp to a readable string
export const formatTimestamp = (date: Date): string => {
  return format(date, 'yyyy/MM/dd (EEE) HH:mm');
};

// Create a timestamp for a specific day and time
export const createTimestamp = (dateStr: string, timeStr: string): string => {
  const date = new Date(dateStr);
  const [hours, minutes] = timeStr.split(':').map(Number);
  date.setHours(hours, minutes);
  return date.toISOString();
};

// Get current timestamp in Japan timezone
export const getCurrentJapanTimestamp = (): Date => {
  return moment.tz('Asia/Tokyo').toDate();
};

// Add days to a timestamp
export const addDaysToTimestamp = (date: Date, days: number): Date => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
};

// Convert timestamp to time input value (HH:mm format)
export const toTimeInputValue = (date: Date): string => {
  return format(date, 'HH:mm');
};

// Convert timestamp to date input value (yyyy-MM-dd format)
export const toDateInputValue = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
}; 