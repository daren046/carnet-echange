package fr.carnet.echange.controller;

import fr.carnet.echange.dto.ApiResponse;
import fr.carnet.echange.dto.auth.ConfirmPhoneCodeDto;
import fr.carnet.echange.dto.auth.ConfirmPhoneCodeResponse;
import fr.carnet.echange.dto.auth.SendPhoneCodeDto;
import fr.carnet.echange.dto.auth.SendPhoneCodeResponse;
import fr.carnet.echange.service.PhoneVerificationService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/verify/phone")
public class PhoneVerificationController {

    private final PhoneVerificationService phoneVerificationService;

    public PhoneVerificationController(PhoneVerificationService phoneVerificationService) {
        this.phoneVerificationService = phoneVerificationService;
    }

    @PostMapping("/send")
    public ApiResponse<SendPhoneCodeResponse> send(@Valid @RequestBody SendPhoneCodeDto dto) {
        SendPhoneCodeResponse data = phoneVerificationService.sendCode(dto.phone());
        String message = data.debugCode() != null
                ? "Code envoyé — pour cette démo : " + data.debugCode()
                : "Code envoyé par SMS";
        return ApiResponse.ok(message, data);
    }

    @PostMapping("/confirm")
    public ApiResponse<ConfirmPhoneCodeResponse> confirm(@Valid @RequestBody ConfirmPhoneCodeDto dto) {
        return ApiResponse.ok("Numéro confirmé", phoneVerificationService.confirm(dto.phone(), dto.code()));
    }
}
