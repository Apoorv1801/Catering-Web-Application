package com.example.caterers.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    // Comma-separated list, read from application.properties
    // (app.cors.allowed-origins), which itself reads the
    // CORS_ALLOWED_ORIGINS environment variable on the server.
    // Defaults to the Live Server ports for local development.
    @Value("${app.cors.allowed-origins:http://127.0.0.1:5500,http://localhost:5500}")
    private String allowedOrigins;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(allowedOrigins.split(","))
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }
}