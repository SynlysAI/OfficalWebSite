CREATE TABLE IF NOT EXISTS faq_feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    faq_id TEXT NOT NULL,
    helpful INTEGER NOT NULL CHECK (helpful IN (0, 1)),
    day TEXT NOT NULL,
    fingerprint TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (faq_id, day, fingerprint)
);
