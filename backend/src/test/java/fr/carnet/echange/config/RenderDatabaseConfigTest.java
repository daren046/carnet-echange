package fr.carnet.echange.config;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class RenderDatabaseConfigTest {

    @Test
    void parseRenderDatabaseUrl() {
        var parsed = RenderDatabaseConfig.ParsedDbUrl.parse(
                "postgresql://carnet:secret@dpg-example-a/carnetechange");

        assertEquals("jdbc:postgresql://dpg-example-a:5432/carnetechange", parsed.jdbcUrl());
        assertEquals("carnet", parsed.username());
        assertEquals("secret", parsed.password());
    }

    @Test
    void postgresEnvCondition() {
        assertTrue(PostgresEnvCondition.isPostgresUrl("postgresql://u:p@host/db"));
        assertTrue(PostgresEnvCondition.isPostgresUrl("postgres://u:p@host/db"));
        assertFalse(PostgresEnvCondition.isPostgresUrl("9a71b1b93289"));
        assertFalse(PostgresEnvCondition.isPostgresUrl(null));
    }
}
