package com.docchat.chat_service.chat.service;

import com.docchat.chat_service.chat.model.ChatToken;
import com.docchat.chat_service.chat.model.ChatTurn;
import java.util.List;
import java.util.UUID;
import reactor.core.publisher.Flux;

public interface ChatService {

    /**
     * Streams the answer token by token.
     *
     * @param documentId optional: when set, only this document is used
     * @param history    optional: previous messages, so follow-up questions make sense
     */
    Flux<ChatToken> stream(String question, UUID documentId, List<ChatTurn> history);
}