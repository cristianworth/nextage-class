CREATE TABLE app.schedule_series (
    id text PRIMARY KEY,
    student_id text NOT NULL REFERENCES app.students(id),
    end_date date,
    created_at timestamptz NOT NULL,
    UNIQUE (id, student_id)
);

CREATE TABLE app.schedule_segments (
    series_id text NOT NULL REFERENCES app.schedule_series(id) ON DELETE CASCADE,
    from_index integer NOT NULL CHECK (from_index >= 0),
    lesson_date date NOT NULL CHECK (EXTRACT(ISODOW FROM lesson_date) BETWEEN 1 AND 5),
    hour integer NOT NULL CHECK (hour BETWEEN 7 AND 22),
    PRIMARY KEY (series_id, from_index)
);

CREATE TABLE app.schedule_lessons (
    id text PRIMARY KEY,
    student_id text NOT NULL REFERENCES app.students(id),
    lesson_date date NOT NULL CHECK (EXTRACT(ISODOW FROM lesson_date) BETWEEN 1 AND 5),
    hour integer NOT NULL CHECK (hour BETWEEN 7 AND 22),
    created_at timestamptz NOT NULL,
    series_id text,
    occurrence_index integer,
    rescheduled_at timestamptz,
    FOREIGN KEY (series_id, student_id) REFERENCES app.schedule_series(id, student_id),
    CHECK ((series_id IS NULL AND occurrence_index IS NULL) OR
           (series_id IS NOT NULL AND occurrence_index IS NOT NULL AND occurrence_index >= 0 AND
            id = 'weekly/' || series_id || '/' || occurrence_index::text))
);

CREATE TABLE app.schedule_blocks (
    id text PRIMARY KEY,
    title text NOT NULL CHECK (char_length(btrim(title)) BETWEEN 1 AND 100),
    block_date date NOT NULL CHECK (EXTRACT(ISODOW FROM block_date) BETWEEN 1 AND 5),
    start_hour integer NOT NULL CHECK (start_hour BETWEEN 7 AND 22),
    end_hour integer NOT NULL CHECK (end_hour > start_hour AND end_hour <= 23),
    repeat text NOT NULL CHECK (repeat IN ('once', 'weekly')),
    end_date date CHECK (end_date IS NULL OR (repeat = 'weekly' AND end_date >= block_date)),
    created_at timestamptz NOT NULL
);

ALTER TABLE app.schedule_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.schedule_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.schedule_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.schedule_blocks ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON app.schedule_series, app.schedule_segments, app.schedule_lessons, app.schedule_blocks FROM PUBLIC;
