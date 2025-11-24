-- SQL to update all businesses with complete data after database is created
UPDATE businesses SET
  opening_hours = '{"monday":{"open":"08:00","close":"17:00","isOpen":true},"tuesday":{"open":"08:00","close":"17:00","isOpen":true},"wednesday":{"open":"08:00","close":"17:00","isOpen":true},"thursday":{"open":"08:00","close":"17:00","isOpen":true},"friday":{"open":"08:00","close":"17:00","isOpen":true},"saturday":{"isOpen":false},"sunday":{"isOpen":false}}',
  availability_status = 'busy',
  years_in_business = 15,
  is_insured = 1,
  is_verified = 1,
  description = 'Heating, ventilation, and air conditioning specialists. Gas Safe registered with 15 years of experience.',
  website = 'https://shoreditchhvac.co.uk'
WHERE id = 'org_shoreditch_hvac';

-- Add for remaining businesses...
