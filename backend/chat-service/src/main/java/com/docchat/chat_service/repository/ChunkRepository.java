package com.docchat.chat_service.document.repository;

import java.util.List;
import java.util.UUID;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class ChunkRepository {

    private final JdbcClient jdbc;

    public ChunkRepository(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    /** Chunk texts of one document, in reading order. */
    public List<String> findContentsInOrder(UUID documentId) {
        return jdbc.sql("""
                SELECT content FROM vector_store
                WHERE metadata->>'documentId' = :documentId
                ORDER BY CAST(metadata->>'chunkIndex' AS integer)
                """)
                .param("documentId", documentId.toString())
                .query(String.class)
                .list();
    }
}