package com.docchat.chat_service.document.model;

/**
 * Document text given to the AI. {@code complete} is true when it is the whole
 * document.
 */
public record DocumentContext(String text, boolean complete) {
}