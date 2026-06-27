-- 48 FIFA World Cup 2026 teams
-- Groups A-L, 4 teams each
-- Confederations: UEFA(16), CONMEBOL(7), CONCACAF(7), CAF(9), AFC(8), OFC(1)

INSERT INTO teams (code, name, group_letter, confederation, flag_path) VALUES
-- Group A
('USA', 'United States',  'A', 'CONCACAF', '/assets/flags/USA.svg'),
('GER', 'Germany',        'A', 'UEFA',     '/assets/flags/GER.svg'),
('MAR', 'Morocco',        'A', 'CAF',      '/assets/flags/MAR.svg'),
('JPN', 'Japan',          'A', 'AFC',      '/assets/flags/JPN.svg'),
-- Group B
('MEX', 'Mexico',         'B', 'CONCACAF', '/assets/flags/MEX.svg'),
('ESP', 'Spain',          'B', 'UEFA',     '/assets/flags/ESP.svg'),
('SEN', 'Senegal',        'B', 'CAF',      '/assets/flags/SEN.svg'),
('KOR', 'South Korea',    'B', 'AFC',      '/assets/flags/KOR.svg'),
-- Group C
('CAN', 'Canada',         'C', 'CONCACAF', '/assets/flags/CAN.svg'),
('ENG', 'England',        'C', 'UEFA',     '/assets/flags/ENG.svg'),
('NGA', 'Nigeria',        'C', 'CAF',      '/assets/flags/NGA.svg'),
('AUS', 'Australia',      'C', 'AFC',      '/assets/flags/AUS.svg'),
-- Group D
('ARG', 'Argentina',      'D', 'CONMEBOL', '/assets/flags/ARG.svg'),
('FRA', 'France',         'D', 'UEFA',     '/assets/flags/FRA.svg'),
('CMR', 'Cameroon',       'D', 'CAF',      '/assets/flags/CMR.svg'),
('IRN', 'Iran',           'D', 'AFC',      '/assets/flags/IRN.svg'),
-- Group E
('BRA', 'Brazil',         'E', 'CONMEBOL', '/assets/flags/BRA.svg'),
('POR', 'Portugal',       'E', 'UEFA',     '/assets/flags/POR.svg'),
('CIV', 'Côte d''Ivoire', 'E', 'CAF',      '/assets/flags/CIV.svg'),
('KSA', 'Saudi Arabia',   'E', 'AFC',      '/assets/flags/KSA.svg'),
-- Group F
('URU', 'Uruguay',        'F', 'CONMEBOL', '/assets/flags/URU.svg'),
('NED', 'Netherlands',    'F', 'UEFA',     '/assets/flags/NED.svg'),
('GHA', 'Ghana',          'F', 'CAF',      '/assets/flags/GHA.svg'),
('JOR', 'Jordan',         'F', 'AFC',      '/assets/flags/JOR.svg'),
-- Group G
('COL', 'Colombia',       'G', 'CONMEBOL', '/assets/flags/COL.svg'),
('ITA', 'Italy',          'G', 'UEFA',     '/assets/flags/ITA.svg'),
('EGY', 'Egypt',          'G', 'CAF',      '/assets/flags/EGY.svg'),
('IRQ', 'Iraq',           'G', 'AFC',      '/assets/flags/IRQ.svg'),
-- Group H
('ECU', 'Ecuador',        'H', 'CONMEBOL', '/assets/flags/ECU.svg'),
('BEL', 'Belgium',        'H', 'UEFA',     '/assets/flags/BEL.svg'),
('RSA', 'South Africa',   'H', 'CAF',      '/assets/flags/RSA.svg'),
('IDN', 'Indonesia',      'H', 'AFC',      '/assets/flags/IDN.svg'),
-- Group I
('VEN', 'Venezuela',      'I', 'CONMEBOL', '/assets/flags/VEN.svg'),
('CRO', 'Croatia',        'I', 'UEFA',     '/assets/flags/CRO.svg'),
('TUN', 'Tunisia',        'I', 'CAF',      '/assets/flags/TUN.svg'),
('NZL', 'New Zealand',    'I', 'OFC',      '/assets/flags/NZL.svg'),
-- Group J
('PAN', 'Panama',         'J', 'CONCACAF', '/assets/flags/PAN.svg'),
('POL', 'Poland',         'J', 'UEFA',     '/assets/flags/POL.svg'),
('SUI', 'Switzerland',    'J', 'UEFA',     '/assets/flags/SUI.svg'),
('PAR', 'Paraguay',       'J', 'CONMEBOL', '/assets/flags/PAR.svg'),
-- Group K
('JAM', 'Jamaica',        'K', 'CONCACAF', '/assets/flags/JAM.svg'),
('DEN', 'Denmark',        'K', 'UEFA',     '/assets/flags/DEN.svg'),
('SRB', 'Serbia',         'K', 'UEFA',     '/assets/flags/SRB.svg'),
('CRC', 'Costa Rica',     'K', 'CONCACAF', '/assets/flags/CRC.svg'),
-- Group L
('HND', 'Honduras',       'L', 'CONCACAF', '/assets/flags/HND.svg'),
('AUT', 'Austria',        'L', 'UEFA',     '/assets/flags/AUT.svg'),
('HUN', 'Hungary',        'L', 'UEFA',     '/assets/flags/HUN.svg'),
('SCO', 'Scotland',       'L', 'UEFA',     '/assets/flags/SCO.svg');
