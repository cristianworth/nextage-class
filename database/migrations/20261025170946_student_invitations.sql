CREATE TABLE app.student_invitations (
    id uuid PRIMARY KEY,
    student_id text NOT NULL UNIQUE REFERENCES app.students(id) ON DELETE RESTRICT,
    email text NOT NULL CHECK (char_length(email) BETWEEN 3 AND 254),
    status text NOT NULL CHECK (status IN ('pending', 'sent', 'needs_review')),
    auth_user_id uuid,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX student_invitations_email ON app.student_invitations(lower(email));
ALTER TABLE app.student_invitations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON app.student_invitations FROM PUBLIC;
