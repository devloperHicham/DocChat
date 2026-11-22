package com.docchat.chat_service.document.service.impl;

import com.docchat.chat_service.document.model.DocumentContext;
import com.docchat.chat_service.document.repository.ChunkRepository;
import com.docchat.chat_service.document.service.DocumentContextService;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class DocumentContextServiceImpl implements DocumentContextService {

    // About 3,000 tokens: leaves room for the prompt inside the model's 8k context.
    private static final int MAX_CONTEXT_CHARS = 12_000;
    private static final int MAX_EXCERPTS = 6;

    private final ChunkRepository chunkRepository;

    public DocumentContextServiceImpl(ChunkRepository chunkRepository) {
        this.chunkRepository = chunkRepository;
    }

    @Override
    public Optional<DocumentContext> load(UUID documentId) {
        List<String> chunks = chunkRepository.findContentsInOrder(documentId);
        if (chunks.isEmpty()) {
            return Optional.empty();
        }
        int total = chunks.stream().mapToInt(String::length).sum();
        if (total <= MAX_CONTEXT_CHARS) {
            return Optional.of(new DocumentContext(String.join("\n\n", chunks), true));
        }
        return Optional.of(new DocumentContext(sample(chunks), false));
    }

    private static String sample(List<String> chunks) {
        int count = Math.min(MAX_EXCERPTS, chunks.size());
        int perExcerpt = MAX_CONTEXT_CHARS / count;
        List<String> picked = new ArrayList<>(count);
        for (int i = 0; i < count; i++) {
            int index = count == 1 ? 0 : (int) Math.round((double) i * (chunks.size() - 1) / (count - 1));
            String text = chunks.get(index);
            picked.add(text.length() > perExcerpt ? text.substring(0, perExcerpt) : text);
        }
        return String.join("\n\n---\n\n", picked);
    }
}