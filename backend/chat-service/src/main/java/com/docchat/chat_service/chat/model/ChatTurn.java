package com.docchat.chat_service.chat.model;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * One previous message, sent by the browser so follow-up questions make sense.
 * Treated as untrusted.
 */
public record ChatTurn(
        @NotNull @Pattern(regexp = "user|assistant") String role,
        @NotNull @Size(max = 2000) String text) {
}