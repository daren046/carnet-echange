package fr.carnet.echange.config;

import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.AutoConfigureBefore;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Conditional;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

/**
 * Connexion PostgreSQL Render — lit DATABASE_URL (standard Render) ou RENDER_DATABASE_URL.
 */
@Configuration
@Conditional(PostgresEnvCondition.class)
@AutoConfigureBefore(DataSourceAutoConfiguration.class)
public class RenderDatabaseConfig {

    private static final Logger log = LoggerFactory.getLogger(RenderDatabaseConfig.class);

    @Bean
    @Primary
    public DataSource renderDataSource(
            @Value("${RENDER_DATABASE_URL:}") String renderDatabaseUrl,
            @Value("${DATABASE_URL:}") String databaseUrl) {
        String source = !renderDatabaseUrl.isBlank() ? renderDatabaseUrl : databaseUrl;
        ParsedDbUrl parsed = ParsedDbUrl.parse(source);

        log.info("PostgreSQL Render : {}:{}/{}", parsed.host(), parsed.port(), parsed.database());

        HikariDataSource dataSource = new HikariDataSource();
        dataSource.setDriverClassName("org.postgresql.Driver");
        dataSource.setJdbcUrl(parsed.jdbcUrl());
        dataSource.setUsername(parsed.username());
        dataSource.setPassword(parsed.password());
        dataSource.setMaximumPoolSize(5);
        return dataSource;
    }

    record ParsedDbUrl(String jdbcUrl, String username, String password, String host, int port, String database) {

        static ParsedDbUrl parse(String url) {
            if (url == null || url.isBlank()) {
                throw new IllegalStateException(
                        "DATABASE_URL manquante. Sur Render : lie carnet-db au service API ou Sync le Blueprint.");
            }

            String normalized = url.trim().replaceFirst("^postgres://", "postgresql://");
            if (!normalized.startsWith("postgresql://")) {
                throw new IllegalStateException(
                        "DATABASE_URL invalide (attendu postgresql://...). Reçu : " + url);
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
            String host = uri.getHost();
            String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + "/" + database;

            return new ParsedDbUrl(jdbcUrl, username, password, host, port, database);
        }

        private static String decode(String value) {
            return URLDecoder.decode(value, StandardCharsets.UTF_8);
        }
    }
}
