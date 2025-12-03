package ltc.events.Modules.util;

public class NifUtil {

    public static boolean validarNif(String nif) {
        if (nif == null || !nif.matches("\\d{9}")) {
            return false;
        }

        int first = Character.getNumericValue(nif.charAt(0));
        if (!(first == 1 || first == 2 || first == 3 || first == 5 || first == 6 || first == 8 || first == 9)) {
            return false;
        }

        int soma = 0;
        int[] pesos = {9, 8, 7, 6, 5, 4, 3, 2};

        for (int i = 0; i < 8; i++) {
            soma += Character.getNumericValue(nif.charAt(i)) * pesos[i];
        }

        int resto = soma % 11;
        int check = 11 - resto;

        if (check >= 10) check = 0;

        return check == Character.getNumericValue(nif.charAt(8));
    }
}
