# Security Policy

## Scope

DocChat is a portfolio and learning project for local document processing and AI-assisted question answering. It is not designed or currently recommended for production deployment or use with highly sensitive documents.

## Supported usage

Run DocChat on a trusted local machine. Do not expose the application, database, pgAdmin, or Ollama ports to the public internet or untrusted networks.

## Security features

The project includes or is intended to include several defensive measures:

- PDF upload validation, including signature checks and file-size limits
- Filename sanitization
- Backend security configuration
- Nginx security headers and API rate limiting
- Pattern-based prompt-injection detection and defensive prompting
- Local model execution without requiring a hosted AI API

These controls reduce certain risks but are not guarantees of security.

## Known limitations

- **No authentication:** the current application does not provide user authentication or authorization.
- **Prompt injection:** pattern-based detection can miss malicious instructions embedded in documents or questions.
- **Model behavior:** a local model can still generate incorrect, misleading, or unsupported answers.
- **Local environment:** local processing does not automatically make the host, network, containers, or stored data secure.
- **Default credentials:** the included configuration is for local development. Replace default passwords and avoid exposing service ports.
- **Sensitive files:** do not upload confidential or sensitive documents unless you understand and accept the risks of this experimental application.

## Reporting a vulnerability

If you believe you have found a security issue, please avoid publishing exploit details or sensitive data in a public issue.

Until a private reporting channel is established, contact the repository maintainer through their GitHub profile and request a private discussion. Include a concise description, steps to reproduce, and potential impact. Do not include real credentials or personal data.

## Deployment guidance

- Keep services bound to localhost for local use.
- Use unique passwords, not the sample/default values.
- Do not deploy this setup publicly without adding authentication, authorization, secure secret management, appropriate network controls, and a security review.
- Review the Docker Compose configuration and port bindings before starting the stack.
- Keep Docker images and dependencies updated.
- Be careful before running `docker compose down -v`, as it deletes persistent volumes.

## Disclaimer

This project is provided as-is for educational and portfolio purposes. No security guarantees are made.
