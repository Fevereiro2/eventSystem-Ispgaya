package ltc.events.Modules.util;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;

public class LoggingUtil {

    private static final Path LOG_PATH = Path.of("logs_app.txt");

    public static synchronized void log(String message) {
        try {
            String line = "[%s] %s%n".formatted(LocalDateTime.now(), message);
            Files.writeString(LOG_PATH,
                    line,
                    java.nio.file.StandardOpenOption.CREATE,
                    java.nio.file.StandardOpenOption.APPEND);
        } catch (Exception ignored) {
            // Evitar quebra de fluxo por falha de log
        }
    }
}
