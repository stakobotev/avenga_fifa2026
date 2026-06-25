-- FIFA World Cup 2026 Official Match Schedule
-- All times in UTC
-- Run this against your PostgreSQL database to initialize all matches

-- ===== GROUP STAGE MATCHES (72 matches) =====

-- ===== GROUP A: Mexico (MEX), South Korea (KOR), South Africa (RSA), Czechia (CZE) =====

-- Match 1: June 11 - Mexico vs South Africa (Opening Match) - 3pm ET = 19:00 UTC
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-11 19:00:00'::timestamp, 'Estadio Azteca', 'Mexico City', 'GROUP', 'A', 1, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'MEX' AND at.code = 'RSA';

-- Match 2: June 11 - South Korea vs Czechia - 10pm ET = 02:00 UTC (June 12)
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-12 02:00:00'::timestamp, 'Estadio Akron', 'Guadalajara', 'GROUP', 'A', 2, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'KOR' AND at.code = 'CZE';

-- Match 3: June 18 - Czechia vs South Africa - 12pm ET = 16:00 UTC
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-18 16:00:00'::timestamp, 'Mercedes-Benz Stadium', 'Atlanta', 'GROUP', 'A', 3, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'CZE' AND at.code = 'RSA';

-- Match 4: June 18 - Mexico vs South Korea - 9pm ET = 01:00 UTC (June 19)
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-19 01:00:00'::timestamp, 'Estadio Akron', 'Guadalajara', 'GROUP', 'A', 4, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'MEX' AND at.code = 'KOR';

-- Match 5: June 24 - Czechia vs Mexico - 9pm ET = 01:00 UTC (June 25)
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-25 01:00:00'::timestamp, 'Estadio Azteca', 'Mexico City', 'GROUP', 'A', 5, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'CZE' AND at.code = 'MEX';

-- Match 6: June 24 - South Africa vs South Korea - 9pm ET = 01:00 UTC (June 25)
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-25 01:00:00'::timestamp, 'Estadio BBVA', 'Monterrey', 'GROUP', 'A', 6, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'RSA' AND at.code = 'KOR';

-- ===== GROUP B: Canada (CAN), Switzerland (SUI), Qatar (QAT), Bosnia-Herzegovina (BIH) =====

-- Match 7: June 12 - Canada vs Bosnia and Herzegovina - 3pm ET = 19:00 UTC
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-12 19:00:00'::timestamp, 'BMO Field', 'Toronto', 'GROUP', 'B', 7, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'CAN' AND at.code = 'BIH';

-- Match 8: June 13 - Qatar vs Switzerland - 3pm ET = 19:00 UTC
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-13 19:00:00'::timestamp, 'Levi''s Stadium', 'San Francisco Bay Area', 'GROUP', 'B', 8, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'QAT' AND at.code = 'SUI';

-- Match 9: June 18 - Switzerland vs Bosnia and Herzegovina - 3pm ET = 19:00 UTC
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-18 19:00:00'::timestamp, 'SoFi Stadium', 'Los Angeles', 'GROUP', 'B', 9, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'SUI' AND at.code = 'BIH';

-- Match 10: June 18 - Canada vs Qatar - 6pm ET = 22:00 UTC
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-18 22:00:00'::timestamp, 'BC Place', 'Vancouver', 'GROUP', 'B', 10, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'CAN' AND at.code = 'QAT';

-- Match 11: June 24 - Switzerland vs Canada - 3pm ET = 19:00 UTC
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-24 19:00:00'::timestamp, 'BC Place', 'Vancouver', 'GROUP', 'B', 11, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'SUI' AND at.code = 'CAN';

-- Match 12: June 24 - Bosnia and Herzegovina vs Qatar - 3pm ET = 19:00 UTC
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-24 19:00:00'::timestamp, 'Lumen Field', 'Seattle', 'GROUP', 'B', 12, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'BIH' AND at.code = 'QAT';

-- ===== GROUP C: Brazil (BRA), Morocco (MAR), Scotland (SCO), Haiti (HAI) =====

-- Match 13: June 13 - Brazil vs Morocco - 6pm ET = 22:00 UTC
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-13 22:00:00'::timestamp, 'MetLife Stadium', 'New Jersey', 'GROUP', 'C', 13, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'BRA' AND at.code = 'MAR';

-- Match 14: June 13 - Haiti vs Scotland - 9pm ET = 01:00 UTC (June 14)
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-14 01:00:00'::timestamp, 'Gillette Stadium', 'Boston', 'GROUP', 'C', 14, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'HAI' AND at.code = 'SCO';

-- Match 15: June 19 - Scotland vs Morocco - 6pm ET = 22:00 UTC
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-19 22:00:00'::timestamp, 'Gillette Stadium', 'Boston', 'GROUP', 'C', 15, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'SCO' AND at.code = 'MAR';

-- Match 16: June 19 - Brazil vs Haiti - 9pm ET = 01:00 UTC (June 20)
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-20 01:00:00'::timestamp, 'Lincoln Financial Field', 'Philadelphia', 'GROUP', 'C', 16, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'BRA' AND at.code = 'HAI';

-- Match 17: June 24 - Scotland vs Brazil - 6pm ET = 22:00 UTC
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-24 22:00:00'::timestamp, 'Hard Rock Stadium', 'Miami', 'GROUP', 'C', 17, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'SCO' AND at.code = 'BRA';

-- Match 18: June 24 - Morocco vs Haiti - 6pm ET = 22:00 UTC
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-24 22:00:00'::timestamp, 'Mercedes-Benz Stadium', 'Atlanta', 'GROUP', 'C', 18, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'MAR' AND at.code = 'HAI';

-- ===== GROUP D: USA, Paraguay (PAR), Australia (AUS), Turkey (TUR) =====

-- Match 19: June 12 - USA vs Paraguay - 9pm ET = 01:00 UTC (June 13)
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-13 01:00:00'::timestamp, 'SoFi Stadium', 'Los Angeles', 'GROUP', 'D', 19, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'USA' AND at.code = 'PAR';

-- Match 20: June 13 - Australia vs Turkey - 12am ET = 04:00 UTC (June 14)
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-14 04:00:00'::timestamp, 'BC Place', 'Vancouver', 'GROUP', 'D', 20, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'AUS' AND at.code = 'TUR';

-- Match 21: June 19 - USA vs Australia - 3pm ET = 19:00 UTC
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-19 19:00:00'::timestamp, 'Lumen Field', 'Seattle', 'GROUP', 'D', 21, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'USA' AND at.code = 'AUS';

-- Match 22: June 19 - Turkey vs Paraguay - 12am ET = 04:00 UTC (June 20)
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-20 04:00:00'::timestamp, 'Levi''s Stadium', 'San Francisco Bay Area', 'GROUP', 'D', 22, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'TUR' AND at.code = 'PAR';

-- Match 23: June 25 - Turkey vs USA - 10pm ET = 02:00 UTC (June 26)
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-26 02:00:00'::timestamp, 'SoFi Stadium', 'Los Angeles', 'GROUP', 'D', 23, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'TUR' AND at.code = 'USA';

-- Match 24: June 25 - Paraguay vs Australia - 10pm ET = 02:00 UTC (June 26)
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-26 02:00:00'::timestamp, 'Levi''s Stadium', 'San Francisco Bay Area', 'GROUP', 'D', 24, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'PAR' AND at.code = 'AUS';

-- ===== GROUP E: Germany (GER), Ecuador (ECU), Ivory Coast (CIV), Curacao (CUW) =====

-- Match 25: June 14 - Germany vs Curacao - 1pm ET = 17:00 UTC
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-14 17:00:00'::timestamp, 'NRG Stadium', 'Houston', 'GROUP', 'E', 25, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'GER' AND at.code = 'CUW';

-- Match 26: June 14 - Ivory Coast vs Ecuador - 7pm ET = 23:00 UTC
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-14 23:00:00'::timestamp, 'Lincoln Financial Field', 'Philadelphia', 'GROUP', 'E', 26, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'CIV' AND at.code = 'ECU';

-- Match 27: June 20 - Germany vs Ivory Coast - 4pm ET = 20:00 UTC
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-20 20:00:00'::timestamp, 'BMO Field', 'Toronto', 'GROUP', 'E', 27, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'GER' AND at.code = 'CIV';

-- Match 28: June 20 - Ecuador vs Curacao - 8pm ET = 00:00 UTC (June 21)
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-21 00:00:00'::timestamp, 'Arrowhead Stadium', 'Kansas City', 'GROUP', 'E', 28, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'ECU' AND at.code = 'CUW';

-- Match 29: June 25 - Ecuador vs Germany - 4pm ET = 20:00 UTC
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-25 20:00:00'::timestamp, 'MetLife Stadium', 'New Jersey', 'GROUP', 'E', 29, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'ECU' AND at.code = 'GER';

-- Match 30: June 25 - Curacao vs Ivory Coast - 4pm ET = 20:00 UTC
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-25 20:00:00'::timestamp, 'Lincoln Financial Field', 'Philadelphia', 'GROUP', 'E', 30, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'CUW' AND at.code = 'CIV';

-- ===== GROUP F: Netherlands (NED), Japan (JPN), Tunisia (TUN), Sweden (SWE) =====

-- Match 31: June 14 - Netherlands vs Japan - 4pm ET = 20:00 UTC
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-14 20:00:00'::timestamp, 'AT&T Stadium', 'Dallas', 'GROUP', 'F', 31, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'NED' AND at.code = 'JPN';

-- Match 32: June 14 - Sweden vs Tunisia - 10pm ET = 02:00 UTC (June 15)
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-15 02:00:00'::timestamp, 'Estadio BBVA', 'Monterrey', 'GROUP', 'F', 32, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'SWE' AND at.code = 'TUN';

-- Match 33: June 20 - Netherlands vs Sweden - 1pm ET = 17:00 UTC
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-20 17:00:00'::timestamp, 'NRG Stadium', 'Houston', 'GROUP', 'F', 33, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'NED' AND at.code = 'SWE';

-- Match 34: June 20 - Tunisia vs Japan - 12am ET = 04:00 UTC (June 21)
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-21 04:00:00'::timestamp, 'Estadio BBVA', 'Monterrey', 'GROUP', 'F', 34, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'TUN' AND at.code = 'JPN';

-- Match 35: June 25 - Japan vs Sweden - 7pm ET = 23:00 UTC
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-25 23:00:00'::timestamp, 'AT&T Stadium', 'Dallas', 'GROUP', 'F', 35, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'JPN' AND at.code = 'SWE';

-- Match 36: June 25 - Tunisia vs Netherlands - 7pm ET = 23:00 UTC
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-25 23:00:00'::timestamp, 'Arrowhead Stadium', 'Kansas City', 'GROUP', 'F', 36, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'TUN' AND at.code = 'NED';

-- ===== GROUP G: Belgium (BEL), Iran (IRN), Egypt (EGY), New Zealand (NZL) =====

-- Match 37: June 15 - Belgium vs Egypt - 3pm ET = 19:00 UTC
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-15 19:00:00'::timestamp, 'Lumen Field', 'Seattle', 'GROUP', 'G', 37, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'BEL' AND at.code = 'EGY';

-- Match 38: June 15 - Iran vs New Zealand - 9pm ET = 01:00 UTC (June 16)
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-16 01:00:00'::timestamp, 'SoFi Stadium', 'Los Angeles', 'GROUP', 'G', 38, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'IRN' AND at.code = 'NZL';

-- Match 39: June 21 - Belgium vs Iran - 3pm ET = 19:00 UTC
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-21 19:00:00'::timestamp, 'SoFi Stadium', 'Los Angeles', 'GROUP', 'G', 39, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'BEL' AND at.code = 'IRN';

-- Match 40: June 21 - New Zealand vs Egypt - 9pm ET = 01:00 UTC (June 22)
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-22 01:00:00'::timestamp, 'BC Place', 'Vancouver', 'GROUP', 'G', 40, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'NZL' AND at.code = 'EGY';

-- Match 41: June 26 - Egypt vs Iran - 11pm ET = 03:00 UTC (June 27)
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-27 03:00:00'::timestamp, 'Lumen Field', 'Seattle', 'GROUP', 'G', 41, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'EGY' AND at.code = 'IRN';

-- Match 42: June 26 - New Zealand vs Belgium - 11pm ET = 03:00 UTC (June 27)
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-27 03:00:00'::timestamp, 'BC Place', 'Vancouver', 'GROUP', 'G', 42, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'NZL' AND at.code = 'BEL';

-- ===== GROUP H: Spain (ESP), Uruguay (URU), Saudi Arabia (KSA), Cape Verde (CPV) =====

-- Match 43: June 15 - Spain vs Cape Verde - 12pm ET = 16:00 UTC
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-15 16:00:00'::timestamp, 'Mercedes-Benz Stadium', 'Atlanta', 'GROUP', 'H', 43, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'ESP' AND at.code = 'CPV';

-- Match 44: June 15 - Saudi Arabia vs Uruguay - 6pm ET = 22:00 UTC
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-15 22:00:00'::timestamp, 'Hard Rock Stadium', 'Miami', 'GROUP', 'H', 44, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'KSA' AND at.code = 'URU';

-- Match 45: June 21 - Spain vs Saudi Arabia - 12pm ET = 16:00 UTC
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-21 16:00:00'::timestamp, 'Mercedes-Benz Stadium', 'Atlanta', 'GROUP', 'H', 45, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'ESP' AND at.code = 'KSA';

-- Match 46: June 21 - Uruguay vs Cape Verde - 6pm ET = 22:00 UTC
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-21 22:00:00'::timestamp, 'Hard Rock Stadium', 'Miami', 'GROUP', 'H', 46, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'URU' AND at.code = 'CPV';

-- Match 47: June 26 - Cape Verde vs Saudi Arabia - 8pm ET = 00:00 UTC (June 27)
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-27 00:00:00'::timestamp, 'NRG Stadium', 'Houston', 'GROUP', 'H', 47, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'CPV' AND at.code = 'KSA';

-- Match 48: June 26 - Uruguay vs Spain - 8pm ET = 00:00 UTC (June 27)
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-27 00:00:00'::timestamp, 'Estadio Akron', 'Guadalajara', 'GROUP', 'H', 48, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'URU' AND at.code = 'ESP';

-- ===== GROUP I: France (FRA), Senegal (SEN), Norway (NOR), Iraq (IRQ) =====

-- Match 49: June 16 - France vs Senegal - 3pm ET = 19:00 UTC
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-16 19:00:00'::timestamp, 'MetLife Stadium', 'New Jersey', 'GROUP', 'I', 49, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'FRA' AND at.code = 'SEN';

-- Match 50: June 16 - Iraq vs Norway - 6pm ET = 22:00 UTC
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-16 22:00:00'::timestamp, 'Gillette Stadium', 'Boston', 'GROUP', 'I', 50, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'IRQ' AND at.code = 'NOR';

-- Match 51: June 22 - France vs Iraq - 5pm ET = 21:00 UTC
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-22 21:00:00'::timestamp, 'Lincoln Financial Field', 'Philadelphia', 'GROUP', 'I', 51, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'FRA' AND at.code = 'IRQ';

-- Match 52: June 22 - Norway vs Senegal - 8pm ET = 00:00 UTC (June 23)
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-23 00:00:00'::timestamp, 'MetLife Stadium', 'New Jersey', 'GROUP', 'I', 52, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'NOR' AND at.code = 'SEN';

-- Match 53: June 26 - Norway vs France - 3pm ET = 19:00 UTC
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-26 19:00:00'::timestamp, 'Gillette Stadium', 'Boston', 'GROUP', 'I', 53, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'NOR' AND at.code = 'FRA';

-- Match 54: June 26 - Senegal vs Iraq - 3pm ET = 19:00 UTC
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-26 19:00:00'::timestamp, 'BMO Field', 'Toronto', 'GROUP', 'I', 54, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'SEN' AND at.code = 'IRQ';

-- ===== GROUP J: Argentina (ARG), Austria (AUT), Algeria (ALG), Jordan (JOR) =====

-- Match 55: June 16 - Argentina vs Algeria - 9pm ET = 01:00 UTC (June 17)
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-17 01:00:00'::timestamp, 'Arrowhead Stadium', 'Kansas City', 'GROUP', 'J', 55, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'ARG' AND at.code = 'ALG';

-- Match 56: June 16 - Austria vs Jordan - 12am ET = 04:00 UTC (June 17)
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-17 04:00:00'::timestamp, 'Levi''s Stadium', 'San Francisco Bay Area', 'GROUP', 'J', 56, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'AUT' AND at.code = 'JOR';

-- Match 57: June 22 - Argentina vs Austria - 1pm ET = 17:00 UTC
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-22 17:00:00'::timestamp, 'AT&T Stadium', 'Dallas', 'GROUP', 'J', 57, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'ARG' AND at.code = 'AUT';

-- Match 58: June 22 - Jordan vs Algeria - 11pm ET = 03:00 UTC (June 23)
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-23 03:00:00'::timestamp, 'Levi''s Stadium', 'San Francisco Bay Area', 'GROUP', 'J', 58, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'JOR' AND at.code = 'ALG';

-- Match 59: June 27 - Algeria vs Austria - 10pm ET = 02:00 UTC (June 28)
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-28 02:00:00'::timestamp, 'Arrowhead Stadium', 'Kansas City', 'GROUP', 'J', 59, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'ALG' AND at.code = 'AUT';

-- Match 60: June 27 - Jordan vs Argentina - 10pm ET = 02:00 UTC (June 28)
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-28 02:00:00'::timestamp, 'AT&T Stadium', 'Dallas', 'GROUP', 'J', 60, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'JOR' AND at.code = 'ARG';

-- ===== GROUP K: Portugal (POR), Colombia (COL), Uzbekistan (UZB), DR Congo (COD) =====

-- Match 61: June 17 - Portugal vs DR Congo - 1pm ET = 17:00 UTC
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-17 17:00:00'::timestamp, 'NRG Stadium', 'Houston', 'GROUP', 'K', 61, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'POR' AND at.code = 'COD';

-- Match 62: June 17 - Uzbekistan vs Colombia - 10pm ET = 02:00 UTC (June 18)
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-18 02:00:00'::timestamp, 'Estadio Azteca', 'Mexico City', 'GROUP', 'K', 62, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'UZB' AND at.code = 'COL';

-- Match 63: June 23 - Portugal vs Uzbekistan - 1pm ET = 17:00 UTC
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-23 17:00:00'::timestamp, 'NRG Stadium', 'Houston', 'GROUP', 'K', 63, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'POR' AND at.code = 'UZB';

-- Match 64: June 23 - Colombia vs DR Congo - 10pm ET = 02:00 UTC (June 24)
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-24 02:00:00'::timestamp, 'Estadio Akron', 'Guadalajara', 'GROUP', 'K', 64, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'COL' AND at.code = 'COD';

-- Match 65: June 27 - Colombia vs Portugal - 7:30pm ET = 23:30 UTC
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-27 23:30:00'::timestamp, 'Hard Rock Stadium', 'Miami', 'GROUP', 'K', 65, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'COL' AND at.code = 'POR';

-- Match 66: June 27 - DR Congo vs Uzbekistan - 7:30pm ET = 23:30 UTC
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-27 23:30:00'::timestamp, 'Mercedes-Benz Stadium', 'Atlanta', 'GROUP', 'K', 66, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'COD' AND at.code = 'UZB';

-- ===== GROUP L: England (ENG), Croatia (CRO), Panama (PAN), Ghana (GHA) =====

-- Match 67: June 17 - England vs Croatia - 4pm ET = 20:00 UTC
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-17 20:00:00'::timestamp, 'AT&T Stadium', 'Dallas', 'GROUP', 'L', 67, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'ENG' AND at.code = 'CRO';

-- Match 68: June 17 - Ghana vs Panama - 7pm ET = 23:00 UTC
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-17 23:00:00'::timestamp, 'BMO Field', 'Toronto', 'GROUP', 'L', 68, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'GHA' AND at.code = 'PAN';

-- Match 69: June 23 - England vs Ghana - 4pm ET = 20:00 UTC
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-23 20:00:00'::timestamp, 'Gillette Stadium', 'Boston', 'GROUP', 'L', 69, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'ENG' AND at.code = 'GHA';

-- Match 70: June 23 - Panama vs Croatia - 7pm ET = 23:00 UTC
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-23 23:00:00'::timestamp, 'BMO Field', 'Toronto', 'GROUP', 'L', 70, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'PAN' AND at.code = 'CRO';

-- Match 71: June 27 - Panama vs England - 5pm ET = 21:00 UTC
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-27 21:00:00'::timestamp, 'MetLife Stadium', 'New Jersey', 'GROUP', 'L', 71, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'PAN' AND at.code = 'ENG';

-- Match 72: June 27 - Croatia vs Ghana - 5pm ET = 21:00 UTC
INSERT INTO matches (home_team_id, away_team_id, match_date, venue, city, stage, group_letter, match_number, status)
SELECT ht.id, at.id, '2026-06-27 21:00:00'::timestamp, 'Lincoln Financial Field', 'Philadelphia', 'GROUP', 'L', 72, 'SCHEDULED'
FROM teams ht, teams at WHERE ht.code = 'CRO' AND at.code = 'GHA';

-- ===== KNOCKOUT STAGE =====

-- ===== ROUND OF 32 (16 matches): June 28 - July 4 =====

-- Match 73: 2A vs 2B - June 28, 12pm PT = 19:00 UTC
INSERT INTO matches (home_placeholder, away_placeholder, match_date, venue, city, stage, match_number, status)
VALUES ('2A', '2B', '2026-06-28 19:00:00'::timestamp, 'SoFi Stadium', 'Los Angeles', 'ROUND_OF_32', 73, 'SCHEDULED');

-- Match 74: 1E vs 3rd - June 29, 4:30pm ET = 20:30 UTC
INSERT INTO matches (home_placeholder, away_placeholder, match_date, venue, city, stage, match_number, status)
VALUES ('1E', '3rd', '2026-06-29 20:30:00'::timestamp, 'Gillette Stadium', 'Boston', 'ROUND_OF_32', 74, 'SCHEDULED');

-- Match 75: 1F vs 2C - June 29, 7pm CT = 01:00 UTC (June 30)
INSERT INTO matches (home_placeholder, away_placeholder, match_date, venue, city, stage, match_number, status)
VALUES ('1F', '2C', '2026-06-30 01:00:00'::timestamp, 'Estadio BBVA', 'Monterrey', 'ROUND_OF_32', 75, 'SCHEDULED');

-- Match 76: 1C vs 2F - June 29, 12pm CT = 17:00 UTC
INSERT INTO matches (home_placeholder, away_placeholder, match_date, venue, city, stage, match_number, status)
VALUES ('1C', '2F', '2026-06-29 17:00:00'::timestamp, 'NRG Stadium', 'Houston', 'ROUND_OF_32', 76, 'SCHEDULED');

-- Match 77: 1I vs 3rd - June 30, 5pm ET = 21:00 UTC
INSERT INTO matches (home_placeholder, away_placeholder, match_date, venue, city, stage, match_number, status)
VALUES ('1I', '3rd', '2026-06-30 21:00:00'::timestamp, 'MetLife Stadium', 'New Jersey', 'ROUND_OF_32', 77, 'SCHEDULED');

-- Match 78: 2E vs 2I - June 30, 12pm CT = 17:00 UTC
INSERT INTO matches (home_placeholder, away_placeholder, match_date, venue, city, stage, match_number, status)
VALUES ('2E', '2I', '2026-06-30 17:00:00'::timestamp, 'AT&T Stadium', 'Dallas', 'ROUND_OF_32', 78, 'SCHEDULED');

-- Match 79: 1A vs 3rd - June 30, 7pm CT = 01:00 UTC (July 1)
INSERT INTO matches (home_placeholder, away_placeholder, match_date, venue, city, stage, match_number, status)
VALUES ('1A', '3rd', '2026-07-01 01:00:00'::timestamp, 'Estadio Azteca', 'Mexico City', 'ROUND_OF_32', 79, 'SCHEDULED');

-- Match 80: 1L vs 3rd - July 1, 12pm ET = 16:00 UTC
INSERT INTO matches (home_placeholder, away_placeholder, match_date, venue, city, stage, match_number, status)
VALUES ('1L', '3rd', '2026-07-01 16:00:00'::timestamp, 'Mercedes-Benz Stadium', 'Atlanta', 'ROUND_OF_32', 80, 'SCHEDULED');

-- Match 81: 1D vs 3rd - July 1, 5pm PT = 00:00 UTC (July 2)
INSERT INTO matches (home_placeholder, away_placeholder, match_date, venue, city, stage, match_number, status)
VALUES ('1D', '3rd', '2026-07-02 00:00:00'::timestamp, 'Levi''s Stadium', 'San Francisco Bay Area', 'ROUND_OF_32', 81, 'SCHEDULED');

-- Match 82: 1G vs 3rd - July 1, 1pm PT = 20:00 UTC
INSERT INTO matches (home_placeholder, away_placeholder, match_date, venue, city, stage, match_number, status)
VALUES ('1G', '3rd', '2026-07-01 20:00:00'::timestamp, 'Lumen Field', 'Seattle', 'ROUND_OF_32', 82, 'SCHEDULED');

-- Match 83: 2K vs 2L - July 2, 7pm ET = 23:00 UTC
INSERT INTO matches (home_placeholder, away_placeholder, match_date, venue, city, stage, match_number, status)
VALUES ('2K', '2L', '2026-07-02 23:00:00'::timestamp, 'BMO Field', 'Toronto', 'ROUND_OF_32', 83, 'SCHEDULED');

-- Match 84: 1H vs 2J - July 2, 12pm PT = 19:00 UTC
INSERT INTO matches (home_placeholder, away_placeholder, match_date, venue, city, stage, match_number, status)
VALUES ('1H', '2J', '2026-07-02 19:00:00'::timestamp, 'SoFi Stadium', 'Los Angeles', 'ROUND_OF_32', 84, 'SCHEDULED');

-- Match 85: 1B vs 3rd - July 2, 8pm PT = 03:00 UTC (July 3)
INSERT INTO matches (home_placeholder, away_placeholder, match_date, venue, city, stage, match_number, status)
VALUES ('1B', '3rd', '2026-07-03 03:00:00'::timestamp, 'BC Place', 'Vancouver', 'ROUND_OF_32', 85, 'SCHEDULED');

-- Match 86: 1J vs 2H - July 3, 6pm ET = 22:00 UTC
INSERT INTO matches (home_placeholder, away_placeholder, match_date, venue, city, stage, match_number, status)
VALUES ('1J', '2H', '2026-07-03 22:00:00'::timestamp, 'Hard Rock Stadium', 'Miami', 'ROUND_OF_32', 86, 'SCHEDULED');

-- Match 87: 1K vs 3rd - July 3, 8:30pm CT = 01:30 UTC (July 4)
INSERT INTO matches (home_placeholder, away_placeholder, match_date, venue, city, stage, match_number, status)
VALUES ('1K', '3rd', '2026-07-04 01:30:00'::timestamp, 'Arrowhead Stadium', 'Kansas City', 'ROUND_OF_32', 87, 'SCHEDULED');

-- Match 88: 2D vs 2G - July 3, 1pm CT = 18:00 UTC
INSERT INTO matches (home_placeholder, away_placeholder, match_date, venue, city, stage, match_number, status)
VALUES ('2D', '2G', '2026-07-03 18:00:00'::timestamp, 'AT&T Stadium', 'Dallas', 'ROUND_OF_32', 88, 'SCHEDULED');

-- ===== ROUND OF 16 (8 matches): July 4-7 =====

-- Match 89: W73 vs W74 - July 4, 1pm ET = 17:00 UTC
INSERT INTO matches (home_placeholder, away_placeholder, match_date, venue, city, stage, match_number, status)
VALUES ('W73', 'W74', '2026-07-04 17:00:00'::timestamp, 'Lincoln Financial Field', 'Philadelphia', 'ROUND_OF_16', 89, 'SCHEDULED');

-- Match 90: W75 vs W76 - July 4, 5pm ET = 21:00 UTC
INSERT INTO matches (home_placeholder, away_placeholder, match_date, venue, city, stage, match_number, status)
VALUES ('W75', 'W76', '2026-07-04 21:00:00'::timestamp, 'NRG Stadium', 'Houston', 'ROUND_OF_16', 90, 'SCHEDULED');

-- Match 91: W77 vs W78 - July 5, 1pm ET = 17:00 UTC
INSERT INTO matches (home_placeholder, away_placeholder, match_date, venue, city, stage, match_number, status)
VALUES ('W77', 'W78', '2026-07-05 17:00:00'::timestamp, 'MetLife Stadium', 'New Jersey', 'ROUND_OF_16', 91, 'SCHEDULED');

-- Match 92: W79 vs W80 - July 5, 5pm ET = 21:00 UTC
INSERT INTO matches (home_placeholder, away_placeholder, match_date, venue, city, stage, match_number, status)
VALUES ('W79', 'W80', '2026-07-05 21:00:00'::timestamp, 'AT&T Stadium', 'Dallas', 'ROUND_OF_16', 92, 'SCHEDULED');

-- Match 93: W81 vs W82 - July 6, 1pm ET = 17:00 UTC
INSERT INTO matches (home_placeholder, away_placeholder, match_date, venue, city, stage, match_number, status)
VALUES ('W81', 'W82', '2026-07-06 17:00:00'::timestamp, 'Hard Rock Stadium', 'Miami', 'ROUND_OF_16', 93, 'SCHEDULED');

-- Match 94: W83 vs W84 - July 6, 5pm ET = 21:00 UTC
INSERT INTO matches (home_placeholder, away_placeholder, match_date, venue, city, stage, match_number, status)
VALUES ('W83', 'W84', '2026-07-06 21:00:00'::timestamp, 'SoFi Stadium', 'Los Angeles', 'ROUND_OF_16', 94, 'SCHEDULED');

-- Match 95: W85 vs W86 - July 7, 1pm ET = 17:00 UTC
INSERT INTO matches (home_placeholder, away_placeholder, match_date, venue, city, stage, match_number, status)
VALUES ('W85', 'W86', '2026-07-07 17:00:00'::timestamp, 'Mercedes-Benz Stadium', 'Atlanta', 'ROUND_OF_16', 95, 'SCHEDULED');

-- Match 96: W87 vs W88 - July 7, 5pm ET = 21:00 UTC
INSERT INTO matches (home_placeholder, away_placeholder, match_date, venue, city, stage, match_number, status)
VALUES ('W87', 'W88', '2026-07-07 21:00:00'::timestamp, 'Levi''s Stadium', 'San Francisco Bay Area', 'ROUND_OF_16', 96, 'SCHEDULED');

-- ===== QUARTER-FINALS (4 matches): July 9-12 =====

-- Match 97: W89 vs W90 - July 9, 4pm ET = 20:00 UTC
INSERT INTO matches (home_placeholder, away_placeholder, match_date, venue, city, stage, match_number, status)
VALUES ('W89', 'W90', '2026-07-09 20:00:00'::timestamp, 'MetLife Stadium', 'New Jersey', 'QUARTERFINAL', 97, 'SCHEDULED');

-- Match 98: W91 vs W92 - July 10, 4pm ET = 20:00 UTC
INSERT INTO matches (home_placeholder, away_placeholder, match_date, venue, city, stage, match_number, status)
VALUES ('W91', 'W92', '2026-07-10 20:00:00'::timestamp, 'AT&T Stadium', 'Dallas', 'QUARTERFINAL', 98, 'SCHEDULED');

-- Match 99: W93 vs W94 - July 11, 4pm ET = 20:00 UTC
INSERT INTO matches (home_placeholder, away_placeholder, match_date, venue, city, stage, match_number, status)
VALUES ('W93', 'W94', '2026-07-11 20:00:00'::timestamp, 'Hard Rock Stadium', 'Miami', 'QUARTERFINAL', 99, 'SCHEDULED');

-- Match 100: W95 vs W96 - July 12, 4pm ET = 20:00 UTC
INSERT INTO matches (home_placeholder, away_placeholder, match_date, venue, city, stage, match_number, status)
VALUES ('W95', 'W96', '2026-07-12 20:00:00'::timestamp, 'SoFi Stadium', 'Los Angeles', 'QUARTERFINAL', 100, 'SCHEDULED');

-- ===== SEMI-FINALS (2 matches): July 14-15 =====

-- Match 101: W97 vs W98 - July 14, 5pm ET = 21:00 UTC
INSERT INTO matches (home_placeholder, away_placeholder, match_date, venue, city, stage, match_number, status)
VALUES ('W97', 'W98', '2026-07-14 21:00:00'::timestamp, 'MetLife Stadium', 'New Jersey', 'SEMIFINAL', 101, 'SCHEDULED');

-- Match 102: W99 vs W100 - July 15, 5pm ET = 21:00 UTC
INSERT INTO matches (home_placeholder, away_placeholder, match_date, venue, city, stage, match_number, status)
VALUES ('W99', 'W100', '2026-07-15 21:00:00'::timestamp, 'AT&T Stadium', 'Dallas', 'SEMIFINAL', 102, 'SCHEDULED');

-- ===== THIRD PLACE MATCH: July 18 =====

-- Match 103: L101 vs L102 - July 18, 4pm ET = 20:00 UTC
INSERT INTO matches (home_placeholder, away_placeholder, match_date, venue, city, stage, match_number, status)
VALUES ('L101', 'L102', '2026-07-18 20:00:00'::timestamp, 'Hard Rock Stadium', 'Miami', 'THIRD_PLACE', 103, 'SCHEDULED');

-- ===== FINAL: July 19 =====

-- Match 104: W101 vs W102 - July 19, 4pm ET = 20:00 UTC
INSERT INTO matches (home_placeholder, away_placeholder, match_date, venue, city, stage, match_number, status)
VALUES ('W101', 'W102', '2026-07-19 20:00:00'::timestamp, 'MetLife Stadium', 'New Jersey', 'FINAL', 104, 'SCHEDULED');
