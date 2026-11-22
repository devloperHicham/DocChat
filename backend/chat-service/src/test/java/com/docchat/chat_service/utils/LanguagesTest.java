package com.docchat.chat_service.utils;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class LanguagesTest {

    @Test
    void detectsFrench() {
        assertThat(Languages.detect("tu peux donner moi info dr cette document")).isEqualTo("French");
        assertThat(Languages.detect("Quelles sont les compétences ?")).isEqualTo("French");
    }

    @Test
    void detectsArabic() {
        assertThat(Languages.detect("ما هو موضوع هذا الملف؟")).isEqualTo("Arabic");
    }

    @Test
    void defaultsToEnglish() {
        assertThat(Languages.detect("What are the two flows of RAG?")).isEqualTo("English");
        assertThat(Languages.detect("")).isEqualTo("English");
        assertThat(Languages.detect(null)).isEqualTo("English");
    }
}