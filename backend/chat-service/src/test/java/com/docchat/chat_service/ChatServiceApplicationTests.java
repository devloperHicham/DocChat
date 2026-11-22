package com.docchat.chat_service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * Full-context smoke test. It needs PostgreSQL and the application's environment variables,
 * so it runs only when SPRING_DATASOURCE_PASSWORD is set (skipped in a bare `mvn test`).
 */
@SpringBootTest
@EnabledIfEnvironmentVariable(named = "SPRING_DATASOURCE_PASSWORD", matches = ".+")
class ChatServiceApplicationTests {

    @Test
    void contextLoads() {
    }
}