package fr.carnet.echange.util;

import fr.carnet.echange.enums.BookCondition;

public final class CaurisRules {

    private CaurisRules() {}

    /**
     * Proposition automatique selon l’état. L’équipe valide (ou ajuste) avant crédit.
     */
    public static int proposedFor(BookCondition condition) {
        if (condition == null) {
            return 1;
        }
        return switch (condition) {
            case NEUF -> 3;
            case BON -> 2;
            case MOYEN -> 1;
            case ABIME -> 1;
        };
    }
}
