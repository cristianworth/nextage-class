CREATE TABLE app.lesson_records (
    lesson_id text PRIMARY KEY REFERENCES app.schedule_lessons(id),
    id text NOT NULL UNIQUE,
    student_name text NOT NULL,
    level text NOT NULL CHECK (level IN ('A1','A2','B1','B2','C1','C2')),
    attendance text NOT NULL CHECK (attendance IN ('attended','student-absent','teacher-absent')),
    content text NOT NULL CHECK (char_length(content) <= 10000 AND (attendance <> 'attended' OR char_length(btrim(content)) > 0)),
    reason text NOT NULL CHECK (char_length(reason) <= 1000),
    material_snapshot jsonb,
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL
);
ALTER TABLE app.lesson_records ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON app.lesson_records FROM PUBLIC;
