package com.docchat.chat_service.security;

import jakarta.servlet.DispatcherType;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

        @Bean
        SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http
                                .csrf(csrf -> csrf.disable()) // stateless API: no cookies, no sessions
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .headers(headers -> headers
                                                .contentSecurityPolicy(csp -> csp.policyDirectives(
                                                                "default-src 'none'; frame-ancestors 'none'"))
                                                .frameOptions(frame -> frame.deny()))
                                .authorizeHttpRequests(auth -> auth
                                                .dispatcherTypeMatchers(DispatcherType.ERROR).permitAll()
                                                .requestMatchers("/actuator/health/**").permitAll()
                                                .requestMatchers("/api/**").permitAll()
                                                .anyRequest().denyAll());
                return http.build();
        }

        /**
         * No users exist yet. Defining this bean stops Spring Boot from generating a
         * default user
         * and a random password at startup. Replaced by JWT authentication in phase 2.
         */
        @Bean
        UserDetailsService userDetailsService() {
                return username -> {
                        throw new UsernameNotFoundException("Authentication is not enabled yet");
                };
        }
}