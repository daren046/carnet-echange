package fr.carnet.echange.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;

/**
 * Render fournit DATABASE_URL au format postgres://user:pass@host/db
 * Cette config prend le relais uniquement quand cette variable est définie.
 */
@Configuration
@ConditionalOnProperty(name = "DATABASE_URL")
public class RenderDatabaseConfig {

    @Bean
    @Primary
    public DataSource renderDataSource(@Value("${DATABASE_URL}") String databaseUrl) {
        HikariDataSource dataSource = new HikariDataSource();
        dataSource.setJdbcUrl(toJdbcUrl(databaseUrl));
        parseCredentials(databaseUrl, dataSource);
        return dataSource;
    }

    static String toJdbcUrl(String url) {
        if (url.startsWith("postgres://")) {
            return "jdbc:postgresql://" + url.substring("postgres://".length());
        }
        if (url.startsWith("postgresql://")) {
            return "jdbc:" + url;
        }
        return url;
    }

    private static void parseCredentials(String url, HikariDataSource dataSource) {
        try {
            String withoutScheme = url.replaceFirst("^postgres(ql)?://", "");
            int at = withoutScheme.lastIndexOf('@');
            if (at <= 0) return;
            String userInfo = withoutScheme.substring(0, at);
            int colon = userInfo.indexOf(':');
            if (colon > 0) {
                dataSource.setUsername(userInfo.substring(0, colon));
                dataSource.setPassword(userInfo.substring(colon + 1));
            }
        } catch (Exception ignored) {
        }
    }
}
