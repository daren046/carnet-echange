package fr.carnet.echange.dto.auth;

public record SendPhoneCodeResponse(int expiresInSeconds, String debugCode) {}
