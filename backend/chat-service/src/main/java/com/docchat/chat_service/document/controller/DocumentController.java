package com.docchat.chat_service.document.controller;

import com.docchat.chat_service.chat.model.ChatToken;
import com.docchat.chat_service.document.model.DocumentUploadResponse;
import com.docchat.chat_service.document.service.IngestionService;
import com.docchat.chat_service.document.service.SummaryService;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Flux;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final IngestionService ingestionService;
    private final SummaryService summaryService;

    public DocumentController(IngestionService ingestionService, SummaryService summaryService) {
        this.ingestionService = ingestionService;
        this.summaryService = summaryService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public DocumentUploadResponse upload(@RequestParam("file") MultipartFile file) {
        return ingestionService.ingest(file);
    }

    // One JSON object per line (NDJSON), same format as the chat endpoint
    @PostMapping(path = "/{documentId}/summary", produces = MediaType.APPLICATION_NDJSON_VALUE)
    public Flux<ChatToken> summary(@PathVariable UUID documentId) {
        return summaryService.summarize(documentId);
    }
}