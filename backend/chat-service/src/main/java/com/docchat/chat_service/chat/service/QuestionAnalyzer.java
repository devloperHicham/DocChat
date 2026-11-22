package com.docchat.chat_service.chat.service;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;
import java.util.stream.Stream;
import org.springframework.stereotype.Component;

/** Decides what kind of question this is, before any search or AI call. */
@Component
public class QuestionAnalyzer {

    private static final int FLAGS = Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE | Pattern.UNICODE_CHARACTER_CLASS;
    private static final int MAX_OVERVIEW_WORDS = 12;

    private static final Pattern MARKS = Pattern.compile("\\p{M}+");
    private static final Pattern INVISIBLE = Pattern
            .compile("[\\u200B-\\u200F\\u202A-\\u202E\\u2066-\\u2069\\u00AD\\u0640]");

    private static final List<Pattern> ATTACK = compile(
            // English
            "(ignore|disregard|forget|override|bypass)\\W+(\\w+\\W+){0,3}(instructions?|rules?|prompts?|guidelines?|restrictions?)",
            "(reveal|show|print|repeat|leak|display)\\W+(me\\W+)?(your|the\\W+system|the\\W+hidden|the\\W+initial|the\\W+above)\\W+(\\w+\\W+)?(prompt|instructions?)",
            "system\\W+prompt|developer\\W+mode|jailbreak|\\bdan\\b",
            "you\\W+are\\W+now|^(please\\W+)?(act|behave|respond)\\W+as\\b|pretend\\W+(to\\W+be|that\\W+you)",
            // French (accents are stripped first)
            "(ignore|ignorez|oublie|oubliez|contourne)\\W+(\\w+\\W+){0,3}(instructions?|consignes?|regles?|restrictions?)",
            "(revele|montre|affiche|repete)\\W+(moi\\W+)?(tes|vos|ton|votre)\\W+(\\w+\\W+)?(prompt|instructions?|consignes?)",
            "prompt\\W+systeme|mode\\W+developpeur",
            // Arabic
            "(تجاهل|تجاوز|انس)\\W+(\\w+\\W+){0,3}(التعليمات|القواعد|الاوامر|القيود)",
            "(اكشف|اظهر|اعرض)\\W+(\\w+\\W+){0,3}(التعليمات|الموجه|النظام)");

    private static final List<Pattern> OVERVIEW = compile(
            // English
            "summar|overview|\\bgist\\b|tl;?dr|synopsis",
            "(main|central|general|key|big)\\W+(idea|point|topic|subject|theme)",
            "(tell|talk|say|speak)\\W+(to\\W+)?(me\\W+)?(about|of)\\W+(\\w+\\W+){0,2}(file|document|doc|pdf|paper|text|it)\\b",
            "what\\W+(is|s)\\W+(this|the|that|it)\\W+(\\w+\\W+){0,2}(about|file|document|pdf)",
            "(describe|explain|present)\\W+(\\w+\\W+){0,2}(file|document|doc|pdf)",
            "give\\W+me\\W+(some\\W+)?(info|information|details)",
            // French
            "resum|apercu|synthese",
            "(idee|sujet|theme|point)\\W+(principal|principale|central|centrale)",
            "de\\W+quoi\\W+(parle|traite)",
            "(parle|parlez|dis|dites|raconte|decris|presente)\\W+(moi\\W+)?(\\w+\\W+){0,2}(document|fichier|pdf|texte|cv)",
            "donn(e|er|ez)\\W+(moi\\W+)?(\\w+\\W+){0,2}(info|informations?|details)",
            "(cette|ce|le|la)\\W+(document|fichier|pdf)\\W+(parle|traite|contient)",
            // Arabic
            "(ملخص|لخص|تلخيص|نبذه|نبذة)",
            "(حدثني|اخبرني|تكلم|تحدث)\\W+(\\w+\\W+){0,2}(الملف|المستند|الوثيقه|الوثيقة|النص)",
            "(ما|ماذا)\\W+(هو|هي|هذا)?\\W*(موضوع|فكره|فكرة|محتوي|محتوى)",
            "(الفكره|الفكرة)\\W+(الرئيسيه|الرئيسية)",
            "معلومات\\W+(عن|حول)\\W+(هذا|الملف|المستند)");

    private static final Pattern VAGUE = Pattern.compile(
            "^(hi|hello|hey|yo|ok|okay|test|talk|thanks|thank\\W+you|more|continue|go\\W+on"
                    + "|salut|bonjour|bonsoir|coucou|salam|merci|plus|encore|suite"
                    + "|مرحبا|اهلا|السلام\\W+عليكم|شكرا|المزيد|تابع)?\\W*$",
            FLAGS);

    private static final Pattern FOLLOW_UP = Pattern.compile(
            "^(more|continue|go\\W+on|plus|encore|suite|المزيد|تابع)\\W*$", FLAGS);

    public QuestionIntent analyze(String question, boolean hasHistory) {
        String q = normalize(question);

        if (matchesAny(ATTACK, q)) {
            return QuestionIntent.BLOCKED;
        }
        if (VAGUE.matcher(q).matches()) {
            // "more" only makes sense after an answer.
            return hasHistory && FOLLOW_UP.matcher(q).matches() ? QuestionIntent.SPECIFIC : QuestionIntent.VAGUE;
        }
        if (wordCount(q) <= MAX_OVERVIEW_WORDS && matchesAny(OVERVIEW, q)) {
            return QuestionIntent.OVERVIEW;
        }
        return QuestionIntent.SPECIFIC;
    }

    private static String normalize(String raw) {
        String text = Normalizer.normalize(raw == null ? "" : raw, Normalizer.Form.NFKD);
        text = MARKS.matcher(text).replaceAll("");
        text = INVISIBLE.matcher(text).replaceAll("");
        return text.toLowerCase(Locale.ROOT).strip();
    }

    private static int wordCount(String text) {
        return text.isEmpty() ? 0 : text.split("\\s+").length;
    }

    private static boolean matchesAny(List<Pattern> patterns, String text) {
        return patterns.stream().anyMatch(pattern -> pattern.matcher(text).find());
    }

    private static List<Pattern> compile(String... regexes) {
        return Stream.of(regexes).map(regex -> Pattern.compile(regex, FLAGS)).toList();
    }
}