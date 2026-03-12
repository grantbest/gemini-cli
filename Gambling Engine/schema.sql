-- Teams Table
CREATE TABLE IF NOT EXISTS teams (
    team_id INT PRIMARY KEY,
    abbreviation VARCHAR(3),
    bullpen_era_rank INT
);

-- Inning Logs for Real-time Monitoring
CREATE TABLE IF NOT EXISTS inning_logs (
    log_id SERIAL PRIMARY KEY,
    game_id INT,
    inning_number INT,
    half VARCHAR(10),
    runs_scored INT,
    baserunners INT,
    batters_faced_total INT,
    UNIQUE (game_id, inning_number, half)
);

-- Bet Tracking Table
CREATE TABLE IF NOT EXISTS bet_tracking (
    bet_id SERIAL PRIMARY KEY,
    game_id INT,
    system_triggered VARCHAR(50),
    odds_taken INT,
    stake DECIMAL,
    result VARCHAR(10) DEFAULT 'PENDING',
    ai_insight TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dynamic Betting Rules Engine Table
CREATE TABLE IF NOT EXISTS betting_rules (
    rule_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'DRY_RUN', -- 'ACTIVE', 'DRY_RUN', 'INACTIVE'
    conditions_json JSONB NOT NULL,
    action_type VARCHAR(50) DEFAULT 'DISCORD_ALERT',
    action_config JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);