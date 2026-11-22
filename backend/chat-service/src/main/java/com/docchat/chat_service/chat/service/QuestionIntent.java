package com.docchat.chat_service.chat.service;

public enum QuestionIntent {
    /** Prompt-injection or jailbreak attempt. */
    BLOCKED,
    /** Greeting or filler: nothing to look up. */
    VAGUE,
    /** "What is this file about?", "main idea", "summary". */
    OVERVIEW,
    /** A normal question about the content. */
    SPECIFIC
}