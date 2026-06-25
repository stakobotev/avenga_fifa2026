-- Fix the Round of 16 -> Final bracket to the official FIFA World Cup 2026 schedule.
--
-- Matches 89-104 were seeded with sequential winner pairings (W73 vs W74, ...)
-- which do not match the official bracket, and with wrong dates/venues. This
-- updates the existing rows in place to the official feeder pairings, dates and
-- venues, and resets any assigned teams back to placeholders (these rounds
-- cannot have real teams until earlier rounds finish). Run once.
--
-- Pairings verified against the official bracket; dates are UTC wall-clock to
-- match how match_date is stored elsewhere ('...'::timestamp).

-- ===== ROUND OF 16 (89-96) =====

UPDATE matches SET home_placeholder = 'W74', away_placeholder = 'W77',
  home_team_id = NULL, away_team_id = NULL, winner_team_id = NULL,
  match_date = '2026-07-04 21:00:00'::timestamp, venue = 'Lincoln Financial Field', city = 'Philadelphia'
  WHERE match_number = 89;

UPDATE matches SET home_placeholder = 'W73', away_placeholder = 'W75',
  home_team_id = NULL, away_team_id = NULL, winner_team_id = NULL,
  match_date = '2026-07-04 17:00:00'::timestamp, venue = 'NRG Stadium', city = 'Houston'
  WHERE match_number = 90;

UPDATE matches SET home_placeholder = 'W76', away_placeholder = 'W78',
  home_team_id = NULL, away_team_id = NULL, winner_team_id = NULL,
  match_date = '2026-07-05 20:00:00'::timestamp, venue = 'MetLife Stadium', city = 'New Jersey'
  WHERE match_number = 91;

UPDATE matches SET home_placeholder = 'W79', away_placeholder = 'W80',
  home_team_id = NULL, away_team_id = NULL, winner_team_id = NULL,
  match_date = '2026-07-06 00:00:00'::timestamp, venue = 'Estadio Azteca', city = 'Mexico City'
  WHERE match_number = 92;

UPDATE matches SET home_placeholder = 'W83', away_placeholder = 'W84',
  home_team_id = NULL, away_team_id = NULL, winner_team_id = NULL,
  match_date = '2026-07-06 19:00:00'::timestamp, venue = 'AT&T Stadium', city = 'Dallas'
  WHERE match_number = 93;

UPDATE matches SET home_placeholder = 'W81', away_placeholder = 'W82',
  home_team_id = NULL, away_team_id = NULL, winner_team_id = NULL,
  match_date = '2026-07-07 00:00:00'::timestamp, venue = 'Lumen Field', city = 'Seattle'
  WHERE match_number = 94;

UPDATE matches SET home_placeholder = 'W86', away_placeholder = 'W88',
  home_team_id = NULL, away_team_id = NULL, winner_team_id = NULL,
  match_date = '2026-07-07 16:00:00'::timestamp, venue = 'Mercedes-Benz Stadium', city = 'Atlanta'
  WHERE match_number = 95;

UPDATE matches SET home_placeholder = 'W85', away_placeholder = 'W87',
  home_team_id = NULL, away_team_id = NULL, winner_team_id = NULL,
  match_date = '2026-07-07 20:00:00'::timestamp, venue = 'BC Place', city = 'Vancouver'
  WHERE match_number = 96;

-- ===== QUARTER-FINALS (97-100) =====

UPDATE matches SET home_placeholder = 'W89', away_placeholder = 'W90',
  home_team_id = NULL, away_team_id = NULL, winner_team_id = NULL,
  match_date = '2026-07-09 20:00:00'::timestamp, venue = 'Gillette Stadium', city = 'Boston'
  WHERE match_number = 97;

UPDATE matches SET home_placeholder = 'W93', away_placeholder = 'W94',
  home_team_id = NULL, away_team_id = NULL, winner_team_id = NULL,
  match_date = '2026-07-10 19:00:00'::timestamp, venue = 'SoFi Stadium', city = 'Los Angeles'
  WHERE match_number = 98;

UPDATE matches SET home_placeholder = 'W91', away_placeholder = 'W92',
  home_team_id = NULL, away_team_id = NULL, winner_team_id = NULL,
  match_date = '2026-07-11 21:00:00'::timestamp, venue = 'Hard Rock Stadium', city = 'Miami'
  WHERE match_number = 99;

UPDATE matches SET home_placeholder = 'W95', away_placeholder = 'W96',
  home_team_id = NULL, away_team_id = NULL, winner_team_id = NULL,
  match_date = '2026-07-12 01:00:00'::timestamp, venue = 'Arrowhead Stadium', city = 'Kansas City'
  WHERE match_number = 100;

-- ===== SEMI-FINALS (101-102) =====

UPDATE matches SET home_placeholder = 'W97', away_placeholder = 'W98',
  home_team_id = NULL, away_team_id = NULL, winner_team_id = NULL,
  match_date = '2026-07-14 19:00:00'::timestamp, venue = 'AT&T Stadium', city = 'Dallas'
  WHERE match_number = 101;

UPDATE matches SET home_placeholder = 'W99', away_placeholder = 'W100',
  home_team_id = NULL, away_team_id = NULL, winner_team_id = NULL,
  match_date = '2026-07-15 19:00:00'::timestamp, venue = 'Mercedes-Benz Stadium', city = 'Atlanta'
  WHERE match_number = 102;

-- ===== THIRD PLACE (103) =====

UPDATE matches SET home_placeholder = 'L101', away_placeholder = 'L102',
  home_team_id = NULL, away_team_id = NULL, winner_team_id = NULL,
  match_date = '2026-07-18 21:00:00'::timestamp, venue = 'Hard Rock Stadium', city = 'Miami'
  WHERE match_number = 103;

-- ===== FINAL (104) =====

UPDATE matches SET home_placeholder = 'W101', away_placeholder = 'W102',
  home_team_id = NULL, away_team_id = NULL, winner_team_id = NULL,
  match_date = '2026-07-19 19:00:00'::timestamp, venue = 'MetLife Stadium', city = 'New Jersey'
  WHERE match_number = 104;

-- Verify:
-- SELECT match_number, stage, home_placeholder, away_placeholder, match_date, venue, city
-- FROM matches WHERE stage NOT IN ('GROUP','ROUND_OF_32') ORDER BY match_number;
