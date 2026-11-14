-- Színkorong szinkron: egyetlen tábla. id = HMAC(PEPPER, a játékosnév + kód lenyomata), data = a haladás JSON-ja.
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);
