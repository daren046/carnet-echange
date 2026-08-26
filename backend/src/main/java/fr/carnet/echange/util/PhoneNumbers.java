package fr.carnet.echange.util;

public final class PhoneNumbers {

    private PhoneNumbers() {}

    public static String normalize(String value) {
        if (value == null) {
            return null;
        }
        String digits = value.replaceAll("[^0-9+]", "");
        if (!digits.matches("^\\+?[0-9]{8,15}$")) {
            return null;
        }
        return digits;
    }
}
