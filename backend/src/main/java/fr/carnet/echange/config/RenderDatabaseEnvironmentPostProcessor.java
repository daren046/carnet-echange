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
 * avant l'auto-config JDBC. Sans Postgres, démarre sur H2 pour ne pas planter le deploy.
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

        String postgresUrl = findPostgresUrl(environment);
        String host = firstNonBlank(environment.getProperty("PGHOST"), System.getenv("PGHOST"));

        Map<String, Object> props = new HashMap<>();
        if (postgresUrl != null) {
            RenderDatabaseUrls.Parsed parsed = RenderDatabaseUrls.parse(postgresUrl);
            applyPostgres(props, parsed.jdbcUrl(), parsed.username(), parsed.password());
            System.out.println("Carnet: PostgreSQL " + parsed.host() + ":" + parsed.port() + "/" + parsed.database());
        } else if (host != null && !host.isBlank()) {
            String port = firstNonBlank(environment.getProperty("PGPORT"), System.getenv("PGPORT"), "5432");
            String database = firstNonBlank(environment.getProperty("PGDATABASE"), System.getenv("PGDATABASE"), "carnetechange");
            String user = firstNonBlank(environment.getProperty("PGUSER"), System.getenv("PGUSER"), environment.getProperty("SPRING_DATASOURCE_USERNAME"));
            String password = firstNonBlank(environment.getProperty("PGPASSWORD"), System.getenv("PGPASSWORD"), environment.getProperty("SPRING_DATASOURCE_PASSWORD"));
            String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + "/" + database + "?sslmode=require";
            applyPostgres(props, jdbcUrl, user, password);
            System.out.println("Carnet: PostgreSQL via PGHOST=" + host);
        } else {
            applyH2(props);
            System.out.println("Carnet: PostgreSQL non lié, démarrage H2. Données réinitialisées à chaque cold start.");
        }

        environment.getPropertySources().addFirst(new MapPropertySource("renderDatabase", props));
    }

    private static void applyPostgres(Map<String, Object> props, String jdbcUrl, String username, String password) {
        props.put("spring.datasource.url", jdbcUrl);
        props.put("spring.datasource.username", username == null ? "" : username);
        props.put("spring.datasource.password", password == null ? "" : password);
        props.put("spring.datasource.driver-class-name", "org.postgresql.Driver");
        props.put("spring.jpa.properties.hibernate.dialect", "org.hibernate.dialect.PostgreSQLDialect");
    }

    private static void applyH2(Map<String, Object> props) {
        props.put("spring.datasource.url",
                "jdbc:h2:file:/tmp/carnet-data/carnetechange;DB_CLOSE_DELAY=-1;AUTO_SERVER=FALSE");
        props.put("spring.datasource.username", "sa");
        props.put("spring.datasource.password", "");
        props.put("spring.datasource.driver-class-name", "org.h2.Driver");
        props.put("spring.jpa.properties.hibernate.dialect", "org.hibernate.dialect.H2Dialect");
        props.put("spring.jpa.hibernate.ddl-auto", "update");
    }

    /** Accepte DATABASE_URL, PG* ou n'importe quelle variable d'environnement postgres://… */
    static String findPostgresUrl(ConfigurableEnvironment environment) {
        String fromKnown = firstPostgresUrl(
                environment.getProperty("DATABASE_URL"),
                environment.getProperty("RENDER_DATABASE_URL"),
                System.getenv("DATABASE_URL"),
                System.getenv("RENDER_DATABASE_URL"),
                System.getenv("POSTGRES_URL"),
                System.getenv("POSTGRESQL_URL"));
        if (fromKnown != null) {
            return fromKnown;
        }
        Map<String, String> env = System.getenv();
        if (env == null) {
            return null;
        }
        for (String value : env.values()) {
            if (RenderDatabaseUrls.isPostgresUrl(value)) {
                return value;
            }
        }
        return null;
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
