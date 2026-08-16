package fr.carnet.echange.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.util.HashMap;
import java.util.Map;

/**
 * Convertit DATABASE_URL Render (postgres://…) en spring.datasource.*
 * avant l'auto-config JDBC — évite le fallback localhost:5432.
 */
public class RenderDatabaseEnvironmentPostProcessor implements EnvironmentPostProcessor, Ordered {

    @Override
    public int getOrder() {
        return Ordered.LOWEST_PRECEDENCE;
    }

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String existingUrl = environment.getProperty("spring.datasource.url", "");
        if (existingUrl.startsWith("jdbc:h2")) {
            return;
        }
        for (String profile : environment.getActiveProfiles()) {
            if ("dev".equals(profile) || "test".equals(profile)) {
                return;
            }
        }

        String postgresUrl = firstPostgresUrl(
                environment.getProperty("DATABASE_URL"),
                environment.getProperty("RENDER_DATABASE_URL"));
        String host = environment.getProperty("PGHOST");
        boolean onRender = environment.getProperty("RENDER") != null
                || environment.getProperty("RENDER_SERVICE_ID") != null;

        Map<String, Object> props = new HashMap<>();
        if (postgresUrl != null) {
            RenderDatabaseUrls.Parsed parsed = RenderDatabaseUrls.parse(postgresUrl);
            apply(props, parsed.jdbcUrl(), parsed.username(), parsed.password());
        } else if (host != null && !host.isBlank()) {
            String port = environment.getProperty("PGPORT", "5432");
            String database = environment.getProperty("PGDATABASE", "carnetechange");
            String user = firstNonBlank(environment.getProperty("PGUSER"), environment.getProperty("SPRING_DATASOURCE_USERNAME"));
            String password = firstNonBlank(environment.getProperty("PGPASSWORD"), environment.getProperty("SPRING_DATASOURCE_PASSWORD"));
            String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + "/" + database + "?sslmode=require";
            apply(props, jdbcUrl, user, password);
        } else if (onRender) {
            throw new IllegalStateException(
                    "Pas de PostgreSQL configuré. Sur Render : Blueprint → Sync, "
                            + "ou Environment → Add from Database → carnet-db (DATABASE_URL).");
        } else {
            return;
        }

        environment.getPropertySources().addFirst(new MapPropertySource("renderDatabase", props));
    }

    private static void apply(Map<String, Object> props, String jdbcUrl, String username, String password) {
        props.put("spring.datasource.url", jdbcUrl);
        props.put("spring.datasource.username", username == null ? "" : username);
        props.put("spring.datasource.password", password == null ? "" : password);
        props.put("spring.datasource.driver-class-name", "org.postgresql.Driver");
        props.put("spring.jpa.properties.hibernate.dialect", "org.hibernate.dialect.PostgreSQLDialect");
    }

    private static String firstPostgresUrl(String... candidates) {
        for (String candidate : candidates) {
            if (RenderDatabaseUrls.isPostgresUrl(candidate)) {
                return candidate;
            }
        }
        return null;
    }

    private static String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return "";
    }
}
