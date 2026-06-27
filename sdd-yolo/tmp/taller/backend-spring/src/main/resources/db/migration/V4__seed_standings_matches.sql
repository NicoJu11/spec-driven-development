-- Pre-computed standings (all 12 groups) + knockout bracket matches
-- Standings are seeded directly for MVP simplicity (not computed from individual match results)
-- goal_difference = goals_for - goals_against

-- ===== GROUP STANDINGS =====
-- Group A: GER 1st, USA 2nd, MAR 3rd, JPN 4th
INSERT INTO standings (group_letter,team_code,played,won,drawn,lost,goals_for,goals_against,goal_difference,points) VALUES
('A','GER',3,3,0,0,7,1,6,9),
('A','USA',3,2,0,1,5,3,2,6),
('A','MAR',3,1,0,2,2,5,-3,3),
('A','JPN',3,0,0,3,1,6,-5,0);

-- Group B: ESP 1st, MEX 2nd, SEN 3rd, KOR 4th
INSERT INTO standings (group_letter,team_code,played,won,drawn,lost,goals_for,goals_against,goal_difference,points) VALUES
('B','ESP',3,3,0,0,6,1,5,9),
('B','MEX',3,2,0,1,4,3,1,6),
('B','SEN',3,1,0,2,2,4,-2,3),
('B','KOR',3,0,0,3,1,5,-4,0);

-- Group C: ENG 1st, CAN 2nd, NGA 3rd, AUS 4th
INSERT INTO standings (group_letter,team_code,played,won,drawn,lost,goals_for,goals_against,goal_difference,points) VALUES
('C','ENG',3,3,0,0,8,2,6,9),
('C','CAN',3,2,0,1,5,4,1,6),
('C','NGA',3,1,0,2,3,5,-2,3),
('C','AUS',3,0,0,3,2,7,-5,0);

-- Group D: ARG 1st, FRA 2nd, CMR 3rd, IRN 4th
INSERT INTO standings (group_letter,team_code,played,won,drawn,lost,goals_for,goals_against,goal_difference,points) VALUES
('D','ARG',3,3,0,0,9,2,7,9),
('D','FRA',3,2,0,1,6,4,2,6),
('D','CMR',3,1,0,2,3,6,-3,3),
('D','IRN',3,0,0,3,1,7,-6,0);

-- Group E: BRA 1st, POR 2nd, CIV 3rd, KSA 4th
INSERT INTO standings (group_letter,team_code,played,won,drawn,lost,goals_for,goals_against,goal_difference,points) VALUES
('E','BRA',3,3,0,0,7,1,6,9),
('E','POR',3,2,0,1,5,3,2,6),
('E','CIV',3,1,0,2,2,4,-2,3),
('E','KSA',3,0,0,3,0,6,-6,0);

-- Group F: NED 1st, URU 2nd, GHA 3rd, JOR 4th
INSERT INTO standings (group_letter,team_code,played,won,drawn,lost,goals_for,goals_against,goal_difference,points) VALUES
('F','NED',3,3,0,0,6,0,6,9),
('F','URU',3,2,0,1,4,2,2,6),
('F','GHA',3,1,0,2,2,4,-2,3),
('F','JOR',3,0,0,3,0,6,-6,0);

-- Group G: COL 1st, ITA 2nd, EGY 3rd, IRQ 4th
INSERT INTO standings (group_letter,team_code,played,won,drawn,lost,goals_for,goals_against,goal_difference,points) VALUES
('G','COL',3,3,0,0,5,0,5,9),
('G','ITA',3,2,0,1,4,2,2,6),
('G','EGY',3,1,0,2,2,4,-2,3),
('G','IRQ',3,0,0,3,0,5,-5,0);

-- Group H: BEL 1st, ECU 2nd, RSA 3rd, IDN 4th
INSERT INTO standings (group_letter,team_code,played,won,drawn,lost,goals_for,goals_against,goal_difference,points) VALUES
('H','BEL',3,3,0,0,6,1,5,9),
('H','ECU',3,2,0,1,4,3,1,6),
('H','RSA',3,1,0,2,2,4,-2,3),
('H','IDN',3,0,0,3,1,5,-4,0);

-- Group I: CRO 1st, VEN 2nd, TUN 3rd, NZL 4th
INSERT INTO standings (group_letter,team_code,played,won,drawn,lost,goals_for,goals_against,goal_difference,points) VALUES
('I','CRO',3,3,0,0,5,1,4,9),
('I','VEN',3,2,0,1,4,3,1,6),
('I','TUN',3,1,0,2,2,4,-2,3),
('I','NZL',3,0,0,3,0,3,-3,0);

-- Group J: SUI 1st, POL 2nd, PAR 3rd, PAN 4th
INSERT INTO standings (group_letter,team_code,played,won,drawn,lost,goals_for,goals_against,goal_difference,points) VALUES
('J','SUI',3,3,0,0,5,1,4,9),
('J','POL',3,2,0,1,4,3,1,6),
('J','PAR',3,1,0,2,2,4,-2,3),
('J','PAN',3,0,0,3,1,4,-3,0);

-- Group K: DEN 1st, SRB 2nd, JAM 3rd, CRC 4th
INSERT INTO standings (group_letter,team_code,played,won,drawn,lost,goals_for,goals_against,goal_difference,points) VALUES
('K','DEN',3,3,0,0,7,2,5,9),
('K','SRB',3,2,0,1,5,4,1,6),
('K','JAM',3,1,0,2,2,4,-2,3),
('K','CRC',3,0,0,3,1,5,-4,0);

-- Group L: AUT 1st, HUN 2nd, SCO 3rd, HND 4th
INSERT INTO standings (group_letter,team_code,played,won,drawn,lost,goals_for,goals_against,goal_difference,points) VALUES
('L','AUT',3,3,0,0,6,1,5,9),
('L','HUN',3,2,0,1,4,3,1,6),
('L','SCO',3,1,0,2,2,4,-2,3),
('L','HND',3,0,0,3,0,4,-4,0);

-- ===== KNOCKOUT BRACKET =====
-- R32 (16 matches) — seeded with qualifiers, scores TBD
INSERT INTO matches (phase,home_team_code,away_team_code,home_score,away_score,match_date,venue,winner_code) VALUES
('R32','GER','RSA',NULL,NULL,'2026-07-04','SoFi Stadium, Los Angeles',NULL),
('R32','USA','EGY',NULL,NULL,'2026-07-04','AT&T Stadium, Dallas',NULL),
('R32','ESP','GHA',NULL,NULL,'2026-07-05','MetLife Stadium, New York',NULL),
('R32','MEX','NGA',NULL,NULL,'2026-07-05','Estadio Azteca, Mexico City',NULL),
('R32','ENG','CIV',NULL,NULL,'2026-07-06','BC Place, Vancouver',NULL),
('R32','CAN','CMR',NULL,NULL,'2026-07-06','BMO Field, Toronto',NULL),
('R32','ARG','SEN',NULL,NULL,'2026-07-07','Hard Rock Stadium, Miami',NULL),
('R32','FRA','MAR',NULL,NULL,'2026-07-07','Levi Stadium, San Francisco',NULL),
('R32','BRA','SRB',NULL,NULL,'2026-07-08','NRG Stadium, Houston',NULL),
('R32','POR','HUN',NULL,NULL,'2026-07-08','Rose Bowl, Los Angeles',NULL),
('R32','NED','POL',NULL,NULL,'2026-07-09','Mercedes-Benz Stadium, Atlanta',NULL),
('R32','URU','SUI',NULL,NULL,'2026-07-09','Estadio BBVA, Monterrey',NULL),
('R32','COL','DEN',NULL,NULL,'2026-07-10','Arrowhead Stadium, Kansas City',NULL),
('R32','ITA','VEN',NULL,NULL,'2026-07-10','Lincoln Financial Field, Philadelphia',NULL),
('R32','BEL','CRO',NULL,NULL,'2026-07-11','Lumen Field, Seattle',NULL),
('R32','ECU','AUT',NULL,NULL,'2026-07-11','Estadio Akron, Guadalajara',NULL);

-- R16 (8 matches) — scores TBD
INSERT INTO matches (phase,home_team_code,away_team_code,home_score,away_score,match_date,venue,winner_code) VALUES
('R16','GER','MEX',NULL,NULL,'2026-07-15','SoFi Stadium, Los Angeles',NULL),
('R16','USA','ESP',NULL,NULL,'2026-07-15','MetLife Stadium, New York',NULL),
('R16','ENG','CAN',NULL,NULL,'2026-07-16','BC Place, Vancouver',NULL),
('R16','ARG','FRA',NULL,NULL,'2026-07-16','Hard Rock Stadium, Miami',NULL),
('R16','BRA','URU',NULL,NULL,'2026-07-17','NRG Stadium, Houston',NULL),
('R16','POR','POL',NULL,NULL,'2026-07-17','Rose Bowl, Los Angeles',NULL),
('R16','COL','ECU',NULL,NULL,'2026-07-18','Mercedes-Benz Stadium, Atlanta',NULL),
('R16','ITA','BEL',NULL,NULL,'2026-07-18','Estadio BBVA, Monterrey',NULL);

-- QF (4 matches) — scores TBD
INSERT INTO matches (phase,home_team_code,away_team_code,home_score,away_score,match_date,venue,winner_code) VALUES
('QF','GER','USA',NULL,NULL,'2026-07-21','SoFi Stadium, Los Angeles',NULL),
('QF','ARG','ENG',NULL,NULL,'2026-07-21','Hard Rock Stadium, Miami',NULL),
('QF','BRA','POR',NULL,NULL,'2026-07-22','NRG Stadium, Houston',NULL),
('QF','COL','ITA',NULL,NULL,'2026-07-22','MetLife Stadium, New York',NULL);

-- SF (2 matches) — with results
INSERT INTO matches (phase,home_team_code,away_team_code,home_score,away_score,match_date,venue,winner_code) VALUES
('SF','ARG','GER',1,0,'2026-07-25','Hard Rock Stadium, Miami','ARG'),
('SF','BRA','COL',2,1,'2026-07-26','SoFi Stadium, Los Angeles','BRA');

-- 3rd place
INSERT INTO matches (phase,home_team_code,away_team_code,home_score,away_score,match_date,venue,winner_code) VALUES
('THIRD_PLACE','GER','COL',2,1,'2026-07-18','MetLife Stadium, New York','GER');

-- Final — Argentina vs Brazil: ARG 3-2 BRA (AET / PEN)
INSERT INTO matches (phase,home_team_code,away_team_code,home_score,away_score,match_date,venue,winner_code) VALUES
('FINAL','ARG','BRA',3,2,'2026-07-19','MetLife Stadium, New York/New Jersey','ARG');
