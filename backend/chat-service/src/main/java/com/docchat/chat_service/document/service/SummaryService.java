package com.docchat.chat_service.document.service;

import com.docchat.chat_service.chat.model.ChatToken;
import java.util.UUID;
import reactor.core.publisher.Flux;

public interface SummaryService {

    /**
     * Streams a short summary of an uploaded document.
     *
     * @throws com.docchat.chat_service.exception.InvalidDocumentException (404) if
     *                                                                     the
     *                                                                     document
     *                                                                     is
     *                                                                     unknown
     */
    Flux<ChatToken> summarize(UUID documentId);
}