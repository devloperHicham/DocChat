package com.docchat.chat_service.document.model;

import java.util.UUID;

public record DocumentUploadResponse(UUID documentId, String filename, int chunks) {
    
}