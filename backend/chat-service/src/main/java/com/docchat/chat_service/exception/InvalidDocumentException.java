package com.docchat.chat_service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

/**
 * Thrown when an uploaded document is rejected. Messages must be safe to show
 * to the client.
 */
public class InvalidDocumentException extends RuntimeException {

    private final HttpStatusCode status;

    public InvalidDocumentException(HttpStatusCode status, String message) {
        super(message);
        this.status = status;
    }

    public static InvalidDocumentException badRequest(String message) {
        return new InvalidDocumentException(HttpStatus.BAD_REQUEST, message);
    }

    public static InvalidDocumentException unprocessable(String message) {
        return new InvalidDocumentException(HttpStatus.UNPROCESSABLE_ENTITY, message);
    }

    public static InvalidDocumentException notFound(String message) {
        return new InvalidDocumentException(HttpStatus.NOT_FOUND, message);
    }

    public HttpStatusCode status() {
        return status;
    }
}