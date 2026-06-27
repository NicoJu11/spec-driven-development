-- Mundial Album 2026 — Schema

CREATE TABLE teams (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    code          VARCHAR(3)   NOT NULL UNIQUE,
    name          VARCHAR(100) NOT NULL,
    group_letter  VARCHAR(1)   NOT NULL,
    confederation VARCHAR(20)  NOT NULL,
    flag_path     VARCHAR(100) NOT NULL
);

CREATE TABLE stickers (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    team_code    VARCHAR(3)   NOT NULL,
    player_name  VARCHAR(100),
    position     VARCHAR(5),
    shirt_number INT,
    image_url    VARCHAR(200) NOT NULL,
    type         VARCHAR(10)  NOT NULL DEFAULT 'PLAYER',
    CONSTRAINT fk_sticker_team FOREIGN KEY (team_code) REFERENCES teams(code)
);

CREATE TABLE standings (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    group_letter    VARCHAR(1)  NOT NULL,
    team_code       VARCHAR(3)  NOT NULL,
    played          INT         NOT NULL DEFAULT 0,
    won             INT         NOT NULL DEFAULT 0,
    drawn           INT         NOT NULL DEFAULT 0,
    lost            INT         NOT NULL DEFAULT 0,
    goals_for       INT         NOT NULL DEFAULT 0,
    goals_against   INT         NOT NULL DEFAULT 0,
    goal_difference INT         NOT NULL DEFAULT 0,
    points          INT         NOT NULL DEFAULT 0
);

CREATE TABLE matches (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    phase           VARCHAR(15) NOT NULL,
    home_team_code  VARCHAR(3),
    away_team_code  VARCHAR(3),
    home_score      INT,
    away_score      INT,
    match_date      DATE,
    venue           VARCHAR(100),
    winner_code     VARCHAR(3)
);

CREATE TABLE collection (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id   VARCHAR(36)  NOT NULL,
    sticker_id   BIGINT       NOT NULL,
    collected_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_collection UNIQUE (session_id, sticker_id),
    CONSTRAINT fk_collection_sticker FOREIGN KEY (sticker_id) REFERENCES stickers(id)
);
