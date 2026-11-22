package com.docchat.chat_service.chat.model;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.UUID;

public record ChatRequest(
                @NotBlank(message = "must not be blank") @Size(max = 2000, message = "must be at most 2000 characters") String question,
                UUID documentId,
                @Size(max = 6, message = "must contain at most 6 messages") List<@Valid ChatTurn> history) {
}