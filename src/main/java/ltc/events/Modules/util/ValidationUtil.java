package ltc.events.Modules.util;

import java.util.regex.Pattern;

public class ValidationUtil {

    private static final Pattern EMAIL = Pattern.compile("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    private static final Pattern DIGITS = Pattern.compile("^\\d+$");

    public static void requireEmail(String email) {
        if (email == null || email.isBlank() || !EMAIL.matcher(email.trim()).matches()) {
            throw new IllegalArgumentException("Email invalido.");
        }
    }

    public static void requirePhone9(String phone) {
        if (phone == null) throw new IllegalArgumentException("Telefone obrigatorio.");
        String p = phone.trim();
        if (!DIGITS.matcher(p).matches() || p.length() != 9) {
            throw new IllegalArgumentException("Telefone deve ter 9 digitos numericos.");
        }
    }

    public static void requireDigits(String value, String fieldName) {
        if (value == null || value.isBlank()) return;
        String v = value.trim();
        if (!DIGITS.matcher(v).matches()) {
            throw new IllegalArgumentException(fieldName + " deve conter apenas numeros.");
        }
    }

    public static double parsePositiveDouble(String value, String fieldName) {
        if (value == null || value.isBlank()) return 0.0;
        try {
            double d = Double.parseDouble(value.trim().replace(',', '.'));
            if (d < 0) throw new IllegalArgumentException(fieldName + " deve ser positivo.");
            return d;
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException(fieldName + " invalido (use apenas numeros).");
        }
    }
}
