import { TimezoneOption } from '../types';

export const TIMEZONES: TimezoneOption[] = [
  { value: 'Pacific/Honolulu', label: 'Hawaii', offset: 'UTC-10:00' },
  { value: 'America/Anchorage', label: 'Alaska', offset: 'UTC-09:00' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US)', offset: 'UTC-08:00' },
  { value: 'America/Denver', label: 'Mountain Time (US)', offset: 'UTC-07:00' },
  { value: 'America/Chicago', label: 'Central Time (US)', offset: 'UTC-06:00' },
  { value: 'America/New_York', label: 'Eastern Time (US)', offset: 'UTC-05:00' },
  { value: 'America/Sao_Paulo', label: 'Brasilia', offset: 'UTC-03:00' },
  { value: 'Europe/London', label: 'London', offset: 'UTC+00:00' },
  { value: 'Europe/Paris', label: 'Paris', offset: 'UTC+01:00' },
  { value: 'Europe/Berlin', label: 'Berlin', offset: 'UTC+01:00' },
  { value: 'Africa/Cairo', label: 'Cairo', offset: 'UTC+02:00' },
  { value: 'Europe/Moscow', label: 'Moscow', offset: 'UTC+03:00' },
  { value: 'Asia/Dubai', label: 'Dubai', offset: 'UTC+04:00' },
  { value: 'Asia/Karachi', label: 'Karachi', offset: 'UTC+05:00' },
  { value: 'Asia/Kolkata', label: 'Mumbai', offset: 'UTC+05:30' },
  { value: 'Asia/Dhaka', label: 'Dhaka', offset: 'UTC+06:00' },
  { value: 'Asia/Bangkok', label: 'Bangkok', offset: 'UTC+07:00' },
  { value: 'Asia/Jakarta', label: 'Jakarta', offset: 'UTC+07:00' },
  { value: 'Asia/Singapore', label: 'Singapore', offset: 'UTC+08:00' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong', offset: 'UTC+08:00' },
  { value: 'Asia/Shanghai', label: 'Shanghai', offset: 'UTC+08:00' },
  { value: 'Asia/Tokyo', label: 'Tokyo', offset: 'UTC+09:00' },
  { value: 'Asia/Seoul', label: 'Seoul', offset: 'UTC+09:00' },
  { value: 'Australia/Sydney', label: 'Sydney', offset: 'UTC+10:00' },
  { value: 'Pacific/Auckland', label: 'Auckland', offset: 'UTC+12:00' },
];

export const DEFAULT_TIMEZONE = 'Asia/Jakarta';

