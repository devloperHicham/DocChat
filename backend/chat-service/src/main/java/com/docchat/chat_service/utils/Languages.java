package com.docchat.chat_service.utils;

import java.text.Normalizer;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * Detects whether a question is Arabic, French or English, so the answer can
 * use the same language.
 */
public final class Languages {

    private static final Pattern ARABIC_LETTER = Pattern.compile("[\\u0600-\\u06FF]");
    private static final Pattern MARKS = Pattern.compile("\\p{M}+");
    private static final Pattern NON_LETTERS = Pattern.compile("[^\\p{L}]+");

    private static final Set<String> FRENCH_WORDS = Set.of(
            "le", "la", "les", "des", "une", "un", "du", "est", "que", "qui", "quoi", "pour", "dans", "cette", "ce",
            "tu", "peux", "moi", "parle", "quelle", "quelles", "quel", "quels", "comment", "pourquoi", "avec", "sur",
            "donne", "donner", "resume", "fais", "dis", "et", "sont", "ses", "son", "sa", "aux", "au");

    private Languages() {
    }

    /** Returns "Arabic", "French" or "English". */
    public static String detect(String text) {
        if (text == null || text.isBlank()) {
            return "English";
        }
        if (ARABIC_LETTER.matcher(text).find()) {
            return "Arabic";
        }
        String plain = MARKS.matcher(Normalizer.normalize(text, Normalizer.Form.NFKD)).replaceAll("");
        for (String word : NON_LETTERS.split(plain.toLowerCase(Locale.ROOT))) {
            if (FRENCH_WORDS.contains(word)) {
                return "French";
            }
        }
        return "English";
    }
}