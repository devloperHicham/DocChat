package com.docchat.chat_service.utils;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.Test;

class PdfFilesTest {

    @Test
    void acceptsPdfSignature() {
        assertThat(PdfFiles.hasPdfHeader("%PDF-1.7 rest".getBytes(StandardCharsets.US_ASCII))).isTrue();
    }

    @Test
    void rejectsOtherContent() {
        assertThat(PdfFiles.hasPdfHeader("hello world".getBytes(StandardCharsets.US_ASCII))).isFalse();
        assertThat(PdfFiles.hasPdfHeader(new byte[0])).isFalse();
        assertThat(PdfFiles.hasPdfHeader(null)).isFalse();
    }

    @Test
    void computesKnownSha256() {
        assertThat(PdfFiles.sha256Hex("abc".getBytes(StandardCharsets.US_ASCII)))
                .isEqualTo("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
    }
}