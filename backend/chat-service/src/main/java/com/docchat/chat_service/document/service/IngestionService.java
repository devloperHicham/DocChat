package com.docchat.chat_service.document.service;

import com.docchat.chat_service.document.model.DocumentUploadResponse;
import org.springframework.web.multipart.MultipartFile;

public interface IngestionService {

    /**
     * Validates a PDF, extracts its text, splits it into chunks, and stores the embeddings.
     *
     * @throws com.docchat.chat_service.exception.InvalidDocumentException if the file is rejected
     */
    DocumentUploadResponse ingest(MultipartFile file);
}