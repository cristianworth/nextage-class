ALTER TABLE app.lesson_records
    ADD COLUMN homework_description text NOT NULL DEFAULT '' CHECK (char_length(homework_description) <= 2000),
    ADD COLUMN homework_corrected_at timestamptz,
    ADD CONSTRAINT homework_correction_requires_description CHECK (homework_corrected_at IS NULL OR char_length(btrim(homework_description)) > 0);
