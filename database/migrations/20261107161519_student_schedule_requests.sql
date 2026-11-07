CREATE TABLE app.scheduling_requests (
    id text PRIMARY KEY,
    student_id text NOT NULL REFERENCES app.students(id) ON DELETE RESTRICT,
    kind text NOT NULL CHECK (kind IN ('once', 'weekly')),
    lesson_date date NOT NULL CHECK (EXTRACT(ISODOW FROM lesson_date) BETWEEN 1 AND 5),
    hour integer NOT NULL CHECK (hour BETWEEN 7 AND 22),
    end_date date,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
    created_at timestamptz NOT NULL DEFAULT now(),
    decided_at timestamptz,
    booking_id text,
    CHECK ((kind = 'weekly' AND (end_date IS NULL OR end_date >= lesson_date)) OR (kind = 'once' AND end_date IS NULL)),
    CHECK ((status = 'pending' AND decided_at IS NULL AND booking_id IS NULL) OR
           (status = 'declined' AND decided_at IS NOT NULL AND booking_id IS NULL) OR
           (status = 'approved' AND decided_at IS NOT NULL AND booking_id IS NOT NULL)),
    CHECK (decided_at IS NULL OR decided_at >= created_at)
);
CREATE UNIQUE INDEX scheduling_requests_pending_unique ON app.scheduling_requests (student_id, kind, lesson_date, hour, end_date) NULLS NOT DISTINCT WHERE status = 'pending';
CREATE INDEX scheduling_requests_student_created ON app.scheduling_requests (student_id, created_at DESC, id DESC);
CREATE UNIQUE INDEX scheduling_requests_booking_unique ON app.scheduling_requests (booking_id) WHERE booking_id IS NOT NULL;
ALTER TABLE app.scheduling_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON app.scheduling_requests FROM PUBLIC;