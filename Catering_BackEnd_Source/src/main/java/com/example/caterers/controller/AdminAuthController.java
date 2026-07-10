package com.example.caterers.controller;

import com.example.caterers.model.AdminCredentials;
import com.example.caterers.repository.AdminCredentialsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/admin")
public class AdminAuthController {

    @Autowired
    private AdminCredentialsRepository adminCredentialsRepository;

    // Ensure default credentials exist on startup
    private AdminCredentials getCredentials() {
        return adminCredentialsRepository.findById(1L).orElseGet(() -> {
            AdminCredentials defaults = new AdminCredentials();
            defaults.setUsername("admin");
            defaults.setPassword("royal@123");
            return adminCredentialsRepository.save(defaults);
        });
    }

    // Login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");

        if (username == null || password == null) {
            return ResponseEntity.badRequest().body("Username and password are required.");
        }

        AdminCredentials creds = getCredentials();

        if (!username.equals(creds.getUsername()) || !password.equals(creds.getPassword())) {
            return ResponseEntity.status(401).body("Invalid username or password.");
        }

        return ResponseEntity.ok(Map.of("message", "Login successful.", "role", "admin"));
    }

    // Change credentials
    @PostMapping("/change-credentials")
    public ResponseEntity<?> changeCredentials(@RequestBody Map<String, String> body) {
        String currentPassword = body.get("currentPassword");
        String newUsername = body.get("newUsername");
        String newPassword = body.get("newPassword");

        if (currentPassword == null || newUsername == null || newPassword == null) {
            return ResponseEntity.badRequest().body("All fields are required.");
        }

        AdminCredentials creds = getCredentials();

        if (!currentPassword.equals(creds.getPassword())) {
            return ResponseEntity.status(401).body("Current password is incorrect.");
        }

        if (newUsername.isBlank()) {
            return ResponseEntity.badRequest().body("Username cannot be empty.");
        }

        if (newPassword.length() < 6) {
            return ResponseEntity.badRequest().body("New password must be at least 6 characters.");
        }

        creds.setUsername(newUsername);
        creds.setPassword(newPassword);
        adminCredentialsRepository.save(creds);

        return ResponseEntity.ok("Credentials updated successfully.");
    }
}