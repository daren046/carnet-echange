package fr.carnet.echange.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

/**
 * Render fournit DATABASE_URL au format postgres://user:pass@host[:port]/db
 * Spring Boot attend jdbc:postgresql://host:port/db + identifiants séparés.
 */
@Configuration
@ConditionalOnProperty(name = "DATABASE_URL")
public class RenderDatabaseConfig {

    @Bean
    @Primary
    public DataSource renderDataSource(@Value("${DATABASE_URL}") String databaseUrl) {
        ParsedDbUrl parsed = ParsedDbUrl.parse(databaseUrl);

        HikariDataSource dataSource = new HikariDataSource();
        dataSource.setDriverClassName("org.postgresql.Driver");
        dataSource.setJdbcUrl(parsed.jdbcUrl());
        dataSource.setUsername(parsed.username());
        dataSource.setPassword(parsed.password());
        return dataSource;
    }

    record ParsedDbUrl(String jdbcUrl, String username, String password) {

        static ParsedDbUrl parse(String url) {
            String normalized = url.replaceFirst("^postgres://", "postgresql://");
            if (!normalized.startsWith("postgresql://")) {
                throw new IllegalArgumentException("Unsupported DATABASE_URL format");
            }

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
            String database = uri.getPath().startsWith("/") ? uri.getPath().substring(1) : uri.getPath();
            String jdbcUrl = "jdbc:postgresql://" + uri.getHost() + ":" + port + "/" + database;

            return new ParsedDbUrl(jdbcUrl, username, password);
        }

        private static String decode(String value) {
            return URLDecoder.decode(value, StandardCharsets.UTF_8);
        }
    }

    /** Conservé pour compatibilité / tests — préférer {@link ParsedDbUrl#parse(String)}. */
    static String toJdbcUrl(String url) {
        return ParsedDbUrl.parse(url).jdbcUrl();
    }
}
