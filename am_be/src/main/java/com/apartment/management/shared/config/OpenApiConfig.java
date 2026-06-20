package com.apartment.management.shared.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI apartmentManagementOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Apartment Management API")
                        .version("v1")
                        .description("API documentation for Apartment Management System"))
                .servers(List.of(new Server()
                        .url("http://localhost:8081")
                        .description("Local development server")));
    }
}
