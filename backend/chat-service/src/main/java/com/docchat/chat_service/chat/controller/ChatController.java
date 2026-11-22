package com.docchat.chat_service.chat.controller;

import com.docchat.chat_service.chat.model.ChatRequest;
import com.docchat.chat_service.chat.model.ChatToken;
import com.docchat.chat_service.chat.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    // One JSON object per line (NDJSON)
    @PostMapping(produces = MediaType.APPLICATION_NDJSON_VALUE)
    public Flux<ChatToken> chat(@Valid @RequestBody ChatRequest request) {
        return chatService.stream(request.question(), request.documentId(), request.history());
    }
}