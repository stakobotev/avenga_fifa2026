-- Migrate existing user regions to the final approved region set.
-- Run AFTER deploying the new enum, BEFORE users log in again.
--
-- Rename / consolidate old region values:
--   PL  -> PL_MY    (Poland renamed; Malaysia added to same bucket)
--   ARG -> LATAM    (Argentina renamed; Brazil/El Salvador/Venezuela/Uruguay/Colombia added)
--   WE  -> OTHER    (Western Europe bucket dropped; collapses into Other)

UPDATE users SET region = 'PL_MY' WHERE region = 'PL';
UPDATE users SET region = 'LATAM' WHERE region = 'ARG';
UPDATE users SET region = 'OTHER' WHERE region = 'WE';
