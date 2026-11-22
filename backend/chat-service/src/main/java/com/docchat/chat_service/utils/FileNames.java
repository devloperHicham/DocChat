package com.docchat.chat_service.utils;

import java.util.regex.Pattern;
import org.springframework.util.StringUtils;

public final class FileNames {

    public static final String DEFAULT_NAME = "document.pdf";
    private static final int MAX_LENGTH = 120;
    private static final Pattern UNSAFE = Pattern.compile("[^\\p{L}\\p{N} ._()\\-]");

    private FileNames() {
    }

    /** Strips any path, replaces unsafe characters, caps the length, and never returns blank. */
    public static String sanitize(String original) {
        if (original == null || original.isBlank()) {
            return DEFAULT_NAME;
        }
        String name = StringUtils.getFilename(StringUtils.cleanPath(original));
        if (name == null || name.isBlank()) {
            return DEFAULT_NAME;
        }
        name = UNSAFE.matcher(name).replaceAll("_").strip();
        if (name.length() > MAX_LENGTH) {
            name = name.substring(0, MAX_LENGTH);
        }
        boolean onlyDotsOrUnderscores = name.chars().allMatch(c -> c == '.' || c == '_');
        return (name.isBlank() || onlyDotsOrUnderscores) ? DEFAULT_NAME : name;
    }
}