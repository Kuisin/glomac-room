import {
  toJapanTimestamp,
  formatTimestamp,
  createTimestamp,
  getCurrentJapanTimestamp,
  addDaysToTimestamp,
  toTimeInputValue,
  toDateInputValue
} from '../utils/timestampUtils';

// Example 1: Create a timestamp for a specific date and time
const specificTimestamp = toJapanTimestamp('2024-05-20', '14:30');
console.log('Specific timestamp:', formatTimestamp(specificTimestamp));

// Example 2: Get current timestamp in Japan timezone
const currentTimestamp = getCurrentJapanTimestamp();
console.log('Current timestamp:', formatTimestamp(currentTimestamp));

// Example 3: Add days to a timestamp
const futureTimestamp = addDaysToTimestamp(currentTimestamp, 7);
console.log('Future timestamp (7 days later):', formatTimestamp(futureTimestamp));

// Example 4: Create ISO timestamp string
const isoTimestamp = createTimestamp('2024-05-20', '14:30');
console.log('ISO timestamp:', isoTimestamp);

// Example 5: Format timestamps for input fields
const timeInput = toTimeInputValue(currentTimestamp);
const dateInput = toDateInputValue(currentTimestamp);
console.log('Time input value:', timeInput);
console.log('Date input value:', dateInput);

// Example 6: Create a course schedule with timestamps
const courseSchedule = {
  title: 'Math Class',
  room: 'F101',
  startTime: toJapanTimestamp('2024-05-20', '09:00'),
  endTime: toJapanTimestamp('2024-05-20', '10:30'),
  description: 'Weekly math class'
};

console.log('Course Schedule:');
console.log('Title:', courseSchedule.title);
console.log('Room:', courseSchedule.room);
console.log('Start Time:', formatTimestamp(courseSchedule.startTime));
console.log('End Time:', formatTimestamp(courseSchedule.endTime));
console.log('Description:', courseSchedule.description); 