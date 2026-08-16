package fr.carnet.echange.config;

import org.springframework.context.annotation.Condition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.core.type.AnnotatedTypeMetadata;

/** Active la config Postgres Render si DATABASE_URL ou RENDER_DATABASE_URL est une URL postgres. */
public class PostgresEnvCondition implements Condition {

    @Override
    public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
        return isPostgresUrl(context.getEnvironment().getProperty("RENDER_DATABASE_URL"))
                || isPostgresUrl(context.getEnvironment().getProperty("DATABASE_URL"));
    }

    static boolean isPostgresUrl(String url) {
        if (url == null || url.isBlank()) {
            return false;
        }
        String trimmed = url.trim();
        return trimmed.startsWith("postgres://") || trimmed.startsWith("postgresql://");
    }
}
