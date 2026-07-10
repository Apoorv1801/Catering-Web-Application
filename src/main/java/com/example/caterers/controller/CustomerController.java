package com.example.caterers.controller;

import com.example.caterers.model.Customer;
import com.example.caterers.repository.CustomerRepository;
import com.example.caterers.service.OTPService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/customer")
public class CustomerController {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private OTPService otpService;

    // ─────────────────────────────────────────────────────────────────────
    // 1. REGISTER — saves name, phone, email; sends OTP to email
    // ─────────────────────────────────────────────────────────────────────
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Customer customer) {
        if (isBlank(customer.getName()))
            return ResponseEntity.badRequest().body("Name is required.");
        if (isBlank(customer.getPhone()) || customer.getPhone().length() < 10)
            return ResponseEntity.badRequest().body("Valid 10-digit phone number is required.");
        if (isBlank(customer.getEmail()) || !customer.getEmail().contains("@"))
            return ResponseEntity.badRequest().body("Valid email address is required.");

        if (customerRepository.findByPhone(customer.getPhone()).isPresent())
            return ResponseEntity.badRequest().body("Phone number already registered. Please login.");
        if (customerRepository.findByEmail(customer.getEmail().toLowerCase()).isPresent())
            return ResponseEntity.badRequest().body("Email already registered. Please login.");

        customer.setEmail(customer.getEmail().toLowerCase());
        customer.setVerified(false);
        customerRepository.save(customer);

        try {
            otpService.generateAndSend(customer.getEmail(), customer.getName());
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body("Registered but failed to send OTP email: " + e.getMessage());
        }

        return ResponseEntity.ok("OTP sent to " + customer.getEmail() + ". Please verify to complete signup.");
    }

    // ─────────────────────────────────────────────────────────────────────
    // 2. VERIFY OTP after signup (marks account as verified)
    // ─────────────────────────────────────────────────────────────────────
    @PostMapping("/verify-signup-otp")
    public ResponseEntity<?> verifySignupOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String otp = body.get("otp");

        if (isBlank(email) || isBlank(otp))
            return ResponseEntity.badRequest().body("Email and OTP are required.");

        Optional<Customer> opt = customerRepository.findByEmail(email.toLowerCase());
        if (opt.isEmpty())
            return ResponseEntity.badRequest().body("Email not registered.");

        if (!otpService.verify(email.toLowerCase(), otp))
            return ResponseEntity.badRequest().body("Invalid or expired OTP.");

        Customer customer = opt.get();
        customer.setVerified(true);
        customerRepository.save(customer);

        return ResponseEntity.ok(Map.of(
                "message", "Account verified successfully.",
                "name", customer.getName(),
                "phone", customer.getPhone(),
                "email", customer.getEmail(),
                "id", customer.getId()));
    }

    // ─────────────────────────────────────────────────────────────────────
    // 3. SEND LOGIN OTP — user provides phone; we look up email and send OTP
    // ─────────────────────────────────────────────────────────────────────
    @PostMapping("/send-login-otp")
    public ResponseEntity<?> sendLoginOtp(@RequestBody Map<String, String> body) {
        String phone = body.get("phone");

        if (isBlank(phone) || phone.length() < 10)
            return ResponseEntity.badRequest().body("Valid 10-digit phone number is required.");

        Optional<Customer> opt = customerRepository.findByPhone(phone);
        if (opt.isEmpty())
            return ResponseEntity.badRequest().body("Phone number not registered. Please sign up first.");

        Customer customer = opt.get();

        try {
            otpService.generateAndSend(customer.getEmail(), customer.getName());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to send OTP: " + e.getMessage());
        }

        // Return masked email so frontend can show "OTP sent to r***@gmail.com"
        String masked = maskEmail(customer.getEmail());
        return ResponseEntity.ok(Map.of(
                "message", "OTP sent to " + masked,
                "maskedEmail", masked));
    }

    // ─────────────────────────────────────────────────────────────────────
    // 4. VERIFY LOGIN OTP — verifies OTP and returns session data
    // ─────────────────────────────────────────────────────────────────────
    @PostMapping("/verify-login-otp")
    public ResponseEntity<?> verifyLoginOtp(@RequestBody Map<String, String> body) {
        String phone = body.get("phone");
        String otp = body.get("otp");

        if (isBlank(phone) || isBlank(otp))
            return ResponseEntity.badRequest().body("Phone and OTP are required.");

        Optional<Customer> opt = customerRepository.findByPhone(phone);
        if (opt.isEmpty())
            return ResponseEntity.badRequest().body("Phone number not registered.");

        Customer customer = opt.get();

        if (!otpService.verify(customer.getEmail(), otp))
            return ResponseEntity.badRequest().body("Invalid or expired OTP.");

        customer.setVerified(true);
        customerRepository.save(customer);

        return ResponseEntity.ok(Map.of(
                "message", "Login successful.",
                "name", customer.getName(),
                "phone", customer.getPhone(),
                "email", customer.getEmail(),
                "id", customer.getId()));
    }

    // ─────────────────────────────────────────────────────────────────────
    // 5. RESEND OTP — works for both signup and login flows
    // ─────────────────────────────────────────────────────────────────────
    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@RequestBody Map<String, String> body) {
        String phone = body.get("phone");

        if (isBlank(phone))
            return ResponseEntity.badRequest().body("Phone is required.");

        Optional<Customer> opt = customerRepository.findByPhone(phone);
        if (opt.isEmpty())
            return ResponseEntity.badRequest().body("Phone not registered.");

        Customer customer = opt.get();
        try {
            otpService.generateAndSend(customer.getEmail(), customer.getName());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to resend OTP: " + e.getMessage());
        }

        return ResponseEntity.ok("OTP resent to " + maskEmail(customer.getEmail()));
    }

    // ─────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────
    private boolean isBlank(String s) {
        return s == null || s.isBlank();
    }

    private String maskEmail(String email) {
        int at = email.indexOf('@');
        if (at <= 1)
            return email;
        return email.charAt(0) + "***" + email.substring(at);
    }
}
