-- Fix the Round of 32 bracket to the official FIFA World Cup 2026 schedule.
--
-- The R32 matches (match_number 73-88) were seeded with an incorrect bracket
-- (wrong pairings, dates and venues), and some had wrong teams assigned by hand.
-- This updates the existing rows in place to the official pairings/dates/venues
-- and resets the teams back to placeholders (home/away/winner team -> NULL), so
-- the slots can be assigned correctly once the groups finish. Run once.
--
-- Pairings verified against the official bracket; dates are UTC wall-clock to
-- match how match_date is stored elsewhere ('...'::timestamp).
-- Third-place opponents use the generic '3rd' placeholder.

UPDATE matches SET home_placeholder = '2A', away_placeholder = '2B',
  home_team_id = NULL, away_team_id = NULL, winner_team_id = NULL,
  match_date = '2026-06-28 19:00:00'::timestamp, venue = 'SoFi Stadium', city = 'Los Angeles'
  WHERE match_number = 73;

UPDATE matches SET home_placeholder = '1E', away_placeholder = '3rd',
  home_team_id = NULL, away_team_id = NULL, winner_team_id = NULL,
  match_date = '2026-06-29 20:30:00'::timestamp, venue = 'Gillette Stadium', city = 'Boston'
  WHERE match_number = 74;

UPDATE matches SET home_placeholder = '1F', away_placeholder = '2C',
  home_team_id = NULL, away_team_id = NULL, winner_team_id = NULL,
  match_date = '2026-06-30 01:00:00'::timestamp, venue = 'Estadio BBVA', city = 'Monterrey'
  WHERE match_number = 75;

UPDATE matches SET home_placeholder = '1C', away_placeholder = '2F',
  home_team_id = NULL, away_team_id = NULL, winner_team_id = NULL,
  match_date = '2026-06-29 17:00:00'::timestamp, venue = 'NRG Stadium', city = 'Houston'
  WHERE match_number = 76;

UPDATE matches SET home_placeholder = '1I', away_placeholder = '3rd',
  home_team_id = NULL, away_team_id = NULL, winner_team_id = NULL,
  match_date = '2026-06-30 21:00:00'::timestamp, venue = 'MetLife Stadium', city = 'New Jersey'
  WHERE match_number = 77;

UPDATE matches SET home_placeholder = '2E', away_placeholder = '2I',
  home_team_id = NULL, away_team_id = NULL, winner_team_id = NULL,
  match_date = '2026-06-30 17:00:00'::timestamp, venue = 'AT&T Stadium', city = 'Dallas'
  WHERE match_number = 78;

UPDATE matches SET home_placeholder = '1A', away_placeholder = '3rd',
  home_team_id = NULL, away_team_id = NULL, winner_team_id = NULL,
  match_date = '2026-07-01 01:00:00'::timestamp, venue = 'Estadio Azteca', city = 'Mexico City'
  WHERE match_number = 79;

UPDATE matches SET home_placeholder = '1L', away_placeholder = '3rd',
  home_team_id = NULL, away_team_id = NULL, winner_team_id = NULL,
  match_date = '2026-07-01 16:00:00'::timestamp, venue = 'Mercedes-Benz Stadium', city = 'Atlanta'
  WHERE match_number = 80;

UPDATE matches SET home_placeholder = '1D', away_placeholder = '3rd',
  home_team_id = NULL, away_team_id = NULL, winner_team_id = NULL,
  match_date = '2026-07-02 00:00:00'::timestamp, venue = 'Levi''s Stadium', city = 'San Francisco Bay Area'
  WHERE match_number = 81;

UPDATE matches SET home_placeholder = '1G', away_placeholder = '3rd',
  home_team_id = NULL, away_team_id = NULL, winner_team_id = NULL,
  match_date = '2026-07-01 20:00:00'::timestamp, venue = 'Lumen Field', city = 'Seattle'
  WHERE match_number = 82;

UPDATE matches SET home_placeholder = '2K', away_placeholder = '2L',
  home_team_id = NULL, away_team_id = NULL, winner_team_id = NULL,
  match_date = '2026-07-02 23:00:00'::timestamp, venue = 'BMO Field', city = 'Toronto'
  WHERE match_number = 83;

UPDATE matches SET home_placeholder = '1H', away_placeholder = '2J',
  home_team_id = NULL, away_team_id = NULL, winner_team_id = NULL,
  match_date = '2026-07-02 19:00:00'::timestamp, venue = 'SoFi Stadium', city = 'Los Angeles'
  WHERE match_number = 84;

UPDATE matches SET home_placeholder = '1B', away_placeholder = '3rd',
  home_team_id = NULL, away_team_id = NULL, winner_team_id = NULL,
  match_date = '2026-07-03 03:00:00'::timestamp, venue = 'BC Place', city = 'Vancouver'
  WHERE match_number = 85;

UPDATE matches SET home_placeholder = '1J', away_placeholder = '2H',
  home_team_id = NULL, away_team_id = NULL, winner_team_id = NULL,
  match_date = '2026-07-03 22:00:00'::timestamp, venue = 'Hard Rock Stadium', city = 'Miami'
  WHERE match_number = 86;

UPDATE matches SET home_placeholder = '1K', away_placeholder = '3rd',
  home_team_id = NULL, away_team_id = NULL, winner_team_id = NULL,
  match_date = '2026-07-04 01:30:00'::timestamp, venue = 'Arrowhead Stadium', city = 'Kansas City'
  WHERE match_number = 87;

UPDATE matches SET home_placeholder = '2D', away_placeholder = '2G',
  home_team_id = NULL, away_team_id = NULL, winner_team_id = NULL,
  match_date = '2026-07-03 18:00:00'::timestamp, venue = 'AT&T Stadium', city = 'Dallas'
  WHERE match_number = 88;

-- Verify:
-- SELECT match_number, home_placeholder, away_placeholder, home_team_id, away_team_id, match_date, venue, city
-- FROM matches WHERE stage = 'ROUND_OF_32' ORDER BY match_number;
