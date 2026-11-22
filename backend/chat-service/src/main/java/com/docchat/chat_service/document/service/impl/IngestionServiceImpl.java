package com.docchat.chat_service.document.service.impl;

import com.docchat.chat_service.document.model.DocumentUploadResponse;
import com.docchat.chat_service.document.service.IngestionService;
import com.docchat.chat_service.exception.InvalidDocumentException;
import com.docchat.chat_service.utils.FileNames;
import com.docchat.chat_service.utils.PdfFiles;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.document.Document;
import org.springframework.ai.reader.pdf.PagePdfDocumentReader;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class IngestionServiceImpl implements IngestionService {

    private static final Logger log = LoggerFactory.getLogger(IngestionServiceImpl.class);

    private final VectorStore vectorStore;

    public IngestionServiceImpl(VectorStore vectorStore) {
        this.vectorStore = vectorStore;
    }

    @Override
    public DocumentUploadResponse ingest(MultipartFile file) {
        byte[] content = readContent(file);

        if (content.length == 0) {
            throw InvalidDocumentException.badRequest("The uploaded file is empty.");
        }
        if (!PdfFiles.hasPdfHeader(content)) {
            throw InvalidDocumentException.badRequest("The uploaded file is not a valid PDF.");
        }

        String filename = FileNames.sanitize(file.getOriginalFilename());
        UUID documentId = UUID.randomUUID();
        String sha256 = PdfFiles.sha256Hex(content);

        List<Document> pages = readPages(content);
        pages.forEach(page -> {
            page.getMetadata().put("documentId", documentId.toString());
            page.getMetadata().put("source", filename);
            page.getMetadata().put("sha256", sha256);
        });

        List<Document> chunks = new TokenTextSplitter().apply(pages);
        if (chunks.isEmpty()) {
            throw InvalidDocumentException.unprocessable(
                    "The PDF contains no extractable text (it may be a scanned document).");
        }
        
        // Reading order, so summaries can sample the document from start to end.
        for (int i = 0; i < chunks.size(); i++) {
            chunks.get(i).getMetadata().put("chunkIndex", i);
        }

        try {
            vectorStore.add(chunks); // embeds each chunk, then stores it
        } catch (RuntimeException ex) {
            removeChunks(documentId);
            throw ex;
        }

        log.info("Ingested document {} ('{}'): {} pages, {} chunks", documentId, filename, pages.size(), chunks.size());
        return new DocumentUploadResponse(documentId, filename, chunks.size());
    }

    private byte[] readContent(MultipartFile file) {
        try {
            return file.getBytes();
        } catch (IOException e) {
            throw new UncheckedIOException("Could not read the uploaded file", e);
        }
    }

    private List<Document> readPages(byte[] content) {
        try {
            return new PagePdfDocumentReader(new ByteArrayResource(content)).get();
        } catch (RuntimeException ex) {
            log.warn("PDF parsing failed", ex);
            throw InvalidDocumentException
                    .unprocessable("The PDF could not be read. It may be corrupted or protected.");
        }
    }

    /**
     * Compensation: remove partially stored chunks. documentId is a UUID, so the
     * filter is injection-safe.
     */
    private void removeChunks(UUID documentId) {
        try {
            vectorStore.delete("documentId == '" + documentId + "'");
        } catch (RuntimeException cleanupError) {
            log.error("Cleanup of document {} failed", documentId, cleanupError);
        }
    }
}