package fr.carnet.echange.service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class PhoneVerificationServiceTest {

    @Autowired PhoneVerificationService service;

    @Test
    void sendAndConfirm_acceptsValidCode() {
        var sent = service.sendCode("70 11 22 33");
        assertNotNull(sent.debugCode());
        assertEquals(6, sent.debugCode().length());
        var confirmed = service.confirm("70112233", sent.debugCode());
        assertNotNull(confirmed.verificationToken());
        assertEquals("70112233", service.requireVerified("70 11 22 33", confirmed.verificationToken()));
    }

    @Test
    void confirm_rejectsWrongCode() {
        service.sendCode("70112234");
        assertThrows(IllegalArgumentException.class, () -> service.confirm("70112234", "000000"));
    }
}
