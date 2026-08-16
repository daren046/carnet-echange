package fr.carnet.echange.config;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

/** Parse les URL Postgres Render (postgres://, postgresql://, jdbc:postgresql://). */
public final class RenderDatabaseUrls {

    private RenderDatabaseUrls() {
    }

    public static boolean isPostgresUrl(String url) {
        if (url == null || url.isBlank()) {
            return false;
        }
        String trimmed = url.trim();
        return trimmed.startsWith("postgres://")
                || trimmed.startsWith("postgresql://")
                || trimmed.startsWith("jdbc:postgresql://");
    }

    public static Parsed parse(String url) {
        if (!isPostgresUrl(url)) {
            throw new IllegalArgumentException("URL Postgres invalide : " + url);
        }

        String normalized = url.trim();
        if (normalized.startsWith("jdbc:")) {
            normalized = normalized.substring("jdbc:".length());
        }
        normalized = normalized.replaceFirst("^postgres://", "postgresql://");

        URI uri = URI.create(normalized);
        String userInfo = uri.getUserInfo();
        String username = "";
        String password = "";
        if (userInfo != null) {
            int colon = userInfo.indexOf(':');
            if (colon >= 0) {
                username = decode(userInfo.substring(0, colon));
                password = decode(userInfo.substring(colon + 1));
            } else {
                username = decode(userInfo);
            }
        }

        int port = uri.getPort() == -1 ? 5432 : uri.getPort();
        String path = uri.getPath() == null ? "" : uri.getPath();
        String database = path.startsWith("/") ? path.substring(1) : path;
        int slash = database.indexOf('/');
        if (slash >= 0) {
            database = database.substring(0, slash);
        }
        String host = uri.getHost();
        if (host == null || host.isBlank()) {
            throw new IllegalArgumentException("Hôte Postgres manquant dans DATABASE_URL");
        }

        String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + "/" + database;
        String query = uri.getQuery();
        if (query == null || query.isBlank()) {
            jdbcUrl += "?sslmode=require";
        } else if (!query.contains("sslmode=")) {
            jdbcUrl += "?" + query + "&sslmode=require";
        } else {
            jdbcUrl += "?" + query;
        }

        return new Parsed(jdbcUrl, username, password, host, port, database);
    }

    private static String decode(String value) {
        return URLDecoder.decode(value, StandardCharsets.UTF_8);
    }

    public record Parsed(String jdbcUrl, String username, String password, String host, int port, String database) {
    }
}
