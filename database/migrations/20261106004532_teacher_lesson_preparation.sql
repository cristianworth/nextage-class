CREATE TABLE app.lesson_plans (
    lesson_id text PRIMARY KEY REFERENCES app.schedule_lessons(id),
    material_id text REFERENCES app.materials(id),
    notes text NOT NULL CHECK (char_length(notes) <= 5000),
    updated_at timestamptz NOT NULL,
    CHECK (material_id IS NOT NULL OR char_length(notes) > 0)
);
ALTER TABLE app.lesson_plans ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON app.lesson_plans FROM PUBLIC;
