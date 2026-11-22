package com.docchat.chat_service.config;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;
import org.springframework.validation.annotation.Validated;

/** Retrieval settings bound from {@code docchat.rag.*}. */
@Validated
@ConfigurationProperties(prefix = "docchat.rag")
public record RagProperties(
        @DefaultValue("4") @Min(1) @Max(20) int topK,
        @DefaultValue("0.5") @DecimalMin("0.0") @DecimalMax("1.0") double similarityThreshold) {
}