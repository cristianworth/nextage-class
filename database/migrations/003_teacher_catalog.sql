CREATE TABLE app.books (
    id text PRIMARY KEY,
    title text NOT NULL CHECK (char_length(btrim(title)) BETWEEN 1 AND 150),
    levels text[] NOT NULL CHECK (cardinality(levels) BETWEEN 1 AND 6 AND levels <@ ARRAY['A1','A2','B1','B2','C1','C2']::text[]),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE app.materials (
    id text PRIMARY KEY,
    title text NOT NULL CHECK (char_length(btrim(title)) BETWEEN 1 AND 150),
    content text NOT NULL CHECK (char_length(btrim(content)) BETWEEN 1 AND 20000),
    book_id text REFERENCES app.books(id) ON DELETE RESTRICT,
    lesson_number integer,
    levels text[] CHECK (levels IS NULL OR (cardinality(levels) BETWEEN 1 AND 6 AND levels <@ ARRAY['A1','A2','B1','B2','C1','C2']::text[])),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CHECK ((book_id IS NULL AND lesson_number IS NULL AND levels IS NOT NULL) OR
           (book_id IS NOT NULL AND lesson_number IS NOT NULL AND lesson_number BETWEEN 1 AND 9999 AND levels IS NULL)),
    CONSTRAINT materials_book_unit_number UNIQUE (book_id, lesson_number)
);

ALTER TABLE app.students ADD COLUMN primary_book_id text REFERENCES app.books(id) ON DELETE RESTRICT;

ALTER TABLE app.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.materials ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON app.books, app.materials FROM PUBLIC;
