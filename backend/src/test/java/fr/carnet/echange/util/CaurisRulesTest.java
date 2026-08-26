package fr.carnet.echange.util;

import fr.carnet.echange.enums.BookCondition;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class CaurisRulesTest {

    @Test
    void proposedFor_scalesWithCondition() {
        assertEquals(3, CaurisRules.proposedFor(BookCondition.NEUF));
        assertEquals(2, CaurisRules.proposedFor(BookCondition.BON));
        assertEquals(1, CaurisRules.proposedFor(BookCondition.MOYEN));
        assertEquals(1, CaurisRules.proposedFor(BookCondition.ABIME));
        assertEquals(1, CaurisRules.proposedFor(null));
    }
}
