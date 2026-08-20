package fr.carnet.echange.util;

public final class CaurisLabels {

    private CaurisLabels() {}

    public static String of(int n) {
        return Math.abs(n) == 1 ? n + " cauri" : n + " cauris";
    }

    public static String extra(int n) {
        return Math.abs(n) == 1 ? "1 cauri supplémentaire" : n + " cauris supplémentaires";
    }
}
