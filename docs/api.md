# DocChat API Reference

DocChat exposes HTTP endpoints for PDF ingestion, summaries, chat, and health monitoring. The frontend communicates with the API through the configured Nginx `/api` proxy.

> **Implementation note:** Verify exact request fields, response event names, and status codes against the controllers and DTOs in the current source before treating this document as a complete contract. The endpoint overview below is based on the project's README.

## Base URL

When running the default local Docker Compose setup:

- Frontend: `http://localhost:4200`
- Backend: `http://localhost:8080`
- API through frontend proxy: `http://localhost:4200/api`

## Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/documents` | Upload a PDF document |
| `POST` | `/api/documents/{id}/summary` | Request/stream the document summary |
| `POST` | `/api/chat` | Ask a question and stream the response |
| `GET` | `/actuator/health` | Check backend health |

## Upload a PDF

`POST /api/documents`

Upload a PDF using a multipart request. The backend validates the file, extracts text, chunks the content, generates embeddings, and stores document passages.

Example using curl (confirm the multipart field name in the controller before use):

```bash
curl -X POST http://localhost:8080/api/documents \
  -F "file=@sample.pdf"
```

The response should provide the document identifier or upload result used by subsequent requests. Confirm the exact response structure in the implementation.

## Request a summary

`POST /api/documents/{id}/summary`

The summary endpoint generates or streams a summary for the uploaded document. The project describes streaming responses using NDJSON.

Example request (illustrative; confirm exact body and response format):

```bash
curl -N -X POST http://localhost:8080/api/documents/DOCUMENT_ID/summary
```

## Ask a question

`POST /api/chat`

Send a question associated with the uploaded document and, where supported, recent conversation context. The backend retrieves relevant document passages and streams the answer.

Example (illustrative only; confirm request DTO field names):

```bash
curl -N -X POST http://localhost:8080/api/chat \
  -H "Content-Type: application/json" \
  -d '{"documentId":"DOCUMENT_ID","question":"What are the main points?"}'
```

## Streaming

Chat and summary operations are described as NDJSON streams. NDJSON is newline-delimited JSON: each line is a separate JSON object, rather than one JSON array. Clients should read the stream incrementally and handle each event according to the actual event schema.

## Health check

`GET /actuator/health`

```bash
curl http://localhost:8080/actuator/health
```

A healthy service typically returns a status of `UP`.

## Error handling

The backend uses structured error handling. Depending on the failure, errors may include:

- Invalid or unsupported upload
- File exceeds the configured upload limit
- PDF contains no extractable text
- Document identifier is invalid or unavailable
- Request validation failure
- Rate limit exceeded
- Internal service or model error

Confirm the exact HTTP status codes and response fields in `GlobalExceptionHandler` and the relevant controllers.

## Related documentation

- [Architecture](architecture.md)
- [Main README](../README.md)
