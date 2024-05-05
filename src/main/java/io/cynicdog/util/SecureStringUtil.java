package io.cynicdog.util;

import java.security.SecureRandom;
import java.util.Base64;

public class SecureStringUtil {

    public static String generateRandomString(int length) {

        SecureRandom random = new SecureRandom();

        byte[] bytes = new byte[length / 2];
        random.nextBytes(bytes);

        StringBuilder sb = new StringBuilder(length);

        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }

        return sb.toString();
    }

    public static String encodeBase64(String value) {
        return Base64.getEncoder().encodeToString(value.getBytes());
    }
}
