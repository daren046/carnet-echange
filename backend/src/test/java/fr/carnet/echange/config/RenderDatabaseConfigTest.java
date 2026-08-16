package fr.carnet.echange.config;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

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
    void parsePostgresSchemeWithPort() {
        var parsed = RenderDatabaseConfig.ParsedDbUrl.parse(
                "postgres://user:pass@db-host:5432/mydb");

        assertEquals("jdbc:postgresql://db-host:5432/mydb", parsed.jdbcUrl());
        assertEquals("user", parsed.username());
        assertEquals("pass", parsed.password());
    }
}
