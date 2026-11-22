package com.docchat.chat_service.utils;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class FileNamesTest {

    @Test
    void keepsNormalNames() {
        assertThat(FileNames.sanitize("report 2026.pdf")).isEqualTo("report 2026.pdf");
    }

    @Test
    void stripsPathsAndTraversal() {
        assertThat(FileNames.sanitize("../../etc/passwd")).isEqualTo("passwd");
        assertThat(FileNames.sanitize("C:\\Users\\me\\cv.pdf")).isEqualTo("cv.pdf");
    }

    @Test
    void replacesUnsafeCharacters() {
        assertThat(FileNames.sanitize("a<b>|c.pdf")).isEqualTo("a_b__c.pdf");
    }

    @Test
    void fallsBackForBlankOrMeaninglessNames() {
        assertThat(FileNames.sanitize(null)).isEqualTo(FileNames.DEFAULT_NAME);
        assertThat(FileNames.sanitize("   ")).isEqualTo(FileNames.DEFAULT_NAME);
        assertThat(FileNames.sanitize("..")).isEqualTo(FileNames.DEFAULT_NAME);
    }

    @Test
    void capsLength() {
        assertThat(FileNames.sanitize("a".repeat(500) + ".pdf").length()).isLessThanOrEqualTo(120);
    }
}