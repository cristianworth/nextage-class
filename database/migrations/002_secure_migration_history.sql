ALTER TABLE app.schema_migrations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON app.schema_migrations FROM PUBLIC;
