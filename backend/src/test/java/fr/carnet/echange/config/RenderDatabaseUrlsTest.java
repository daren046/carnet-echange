package fr.carnet.echange.config;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class RenderDatabaseUrlsTest {

    @Test
    void parseRenderInternalUrl() {
        var parsed = RenderDatabaseUrls.parse(
                "postgresql://carnet:secret@dpg-example-a/carnetechange");

        assertEquals("jdbc:postgresql://dpg-example-a:5432/carnetechange?sslmode=require", parsed.jdbcUrl());
        assertEquals("carnet", parsed.username());
        assertEquals("secret", parsed.password());
        assertEquals("dpg-example-a", parsed.host());
    }

    @Test
    void parsePostgresSchemeWithPort() {
        var parsed = RenderDatabaseUrls.parse(
                "postgres://user:pass@db-host:5432/mydb");

        assertEquals("jdbc:postgresql://db-host:5432/mydb?sslmode=require", parsed.jdbcUrl());
        assertEquals("user", parsed.username());
        assertEquals("pass", parsed.password());
    }

    @Test
    void parseNaiveJdbcUrlWithCredentialsInHost() {
        var parsed = RenderDatabaseUrls.parse(
                "jdbc:postgresql://carnet:HOuWcNz04sulnJMwG81AnOFoajhbxGvR@dpg-da0vgq15efls73aj1080-a/carnetechange");

        assertEquals("jdbc:postgresql://dpg-da0vgq15efls73aj1080-a:5432/carnetechange?sslmode=require", parsed.jdbcUrl());
        assertEquals("carnet", parsed.username());
        assertEquals("HOuWcNz04sulnJMwG81AnOFoajhbxGvR", parsed.password());
    }

    @Test
    void ignoreInvalidDatabaseUrl() {
        assertFalse(RenderDatabaseUrls.isPostgresUrl("9a71b1b93289e1d0e3f5cebbccc08779"));
        assertFalse(RenderDatabaseUrls.isPostgresUrl(null));
        assertTrue(RenderDatabaseUrls.isPostgresUrl("postgresql://u:p@host/db"));
        assertTrue(RenderDatabaseUrls.isPostgresUrl("jdbc:postgresql://host/db"));
    }
}
