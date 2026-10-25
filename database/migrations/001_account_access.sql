CREATE TABLE app.students (
    id text PRIMARY KEY,
    name text NOT NULL CHECK (char_length(btrim(name)) BETWEEN 1 AND 100),
    level text NOT NULL CHECK (level IN ('A1','A2','B1','B2','C1','C2')),
    start_date date NOT NULL,
    phone text NOT NULL DEFAULT '' CHECK (char_length(phone) <= 50),
    occupation text NOT NULL DEFAULT '' CHECK (char_length(occupation) <= 150),
    interests text NOT NULL DEFAULT '' CHECK (char_length(interests) <= 1000),
    meeting_url text NOT NULL DEFAULT '' CHECK (char_length(meeting_url) <= 2000),
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE app.access_profiles (
    user_id uuid PRIMARY KEY,
    role text NOT NULL CHECK (role IN ('teacher','student')),
    student_id text UNIQUE REFERENCES app.students(id) ON DELETE RESTRICT,
    display_name text NOT NULL CHECK (char_length(btrim(display_name)) BETWEEN 1 AND 100),
    active boolean NOT NULL DEFAULT true,
    CHECK ((role = 'teacher' AND student_id IS NULL) OR (role = 'student' AND student_id IS NOT NULL))
);
CREATE UNIQUE INDEX access_profiles_single_teacher ON app.access_profiles(role) WHERE role = 'teacher';

ALTER TABLE app.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.access_profiles ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON app.students, app.access_profiles FROM PUBLIC;
REVOKE ALL ON SCHEMA app FROM PUBLIC;
