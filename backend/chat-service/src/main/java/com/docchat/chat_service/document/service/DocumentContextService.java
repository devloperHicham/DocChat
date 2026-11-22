package com.docchat.chat_service.document.service;

import com.docchat.chat_service.document.model.DocumentContext;
import java.util.Optional;
import java.util.UUID;

public interface DocumentContextService {

    /**
     * The whole document if it fits the AI's budget, otherwise an evenly spaced
     * sample. Empty if unknown.
     */
    Optional<DocumentContext> load(UUID documentId);
}