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
    // 1. REGISTER — saves name, phone, email, password; marks verified=true
    // No OTP needed on signup. Account is ready immediately.
    // ─────────────────────────────────────────────────────────────────────
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Customer customer) {
        if (isBlank(customer.getName()))
            return ResponseEntity.badRequest().body("Name is required.");
        if (isBlank(customer.getPhone()) || customer.getPhone().length() < 10)
            return ResponseEntity.badRequest().body("Valid 10-digit phone number is required.");
        if (isBlank(customer.getEmail()) || !customer.getEmail().contains("@"))
            return ResponseEntity.badRequest().body("Valid email address is required.");
        if (isBlank(customer.getPassword()) || customer.getPassword().length() < 6)
            return ResponseEntity.badRequest().body("Password must be at least 6 characters.");

        if (customerRepository.findByPhone(customer.getPhone()).isPresent())
            return ResponseEntity.badRequest().body("Phone number already registered. Please login.");
        if (customerRepository.findByEmail(customer.getEmail().toLowerCase()).isPresent())
            return ResponseEntity.badRequest().body("Email already registered. Please login.");

        customer.setEmail(customer.getEmail().toLowerCase());
        customer.setVerified(true); // No OTP required — password is enough
        customerRepository.save(customer);

        return ResponseEntity.ok("Account created successfully.");
    }

    // ─────────────────────────────────────────────────────────────────────
    // 2. LOGIN WITH PASSWORD — primary login method for hirers / demo
    // ─────────────────────────────────────────────────────────────────────
    @PostMapping("/login-password")
    public ResponseEntity<?> loginWithPassword(@RequestBody Map<String, String> body) {
        String phone = body.get("phone");
        String password = body.get("password");

        if (isBlank(phone) || isBlank(password))
            return ResponseEntity.badRequest().body("Phone and password are required.");

        Optional<Customer> opt = customerRepository.findByPhone(phone);
        if (opt.isEmpty())
            return ResponseEntity.badRequest().body("Phone number not registered. Please sign up first.");

        Customer customer = opt.get();

        if (isBlank(customer.getPassword()))
            return ResponseEntity.badRequest().body("No password set. Use OTP login instead.");

        if (!customer.getPassword().equals(password))
            return ResponseEntity.badRequest().body("Incorrect password.");

        return ResponseEntity.ok(Map.of(
                "message", "Login successful.",
                "name", customer.getName(),
                "phone", customer.getPhone(),
                "email", customer.getEmail(),
                "id", customer.getId()));
    }

    // ─────────────────────────────────────────────────────────────────────
    // 3. UPDATE PASSWORD — called after OTP login to set a new password
    // ─────────────────────────────────────────────────────────────────────
    @PostMapping("/update-password")
    public ResponseEntity<?> updatePassword(@RequestBody Map<String, String> body) {
        String phone = body.get("phone");
        String password = body.get("password");

        if (isBlank(phone) || isBlank(password))
            return ResponseEntity.badRequest().body("Phone and password are required.");
        if (password.length() < 6)
            return ResponseEntity.badRequest().body("Password must be at least 6 characters.");

        Optional<Customer> opt = customerRepository.findByPhone(phone);
        if (opt.isEmpty())
            return ResponseEntity.badRequest().body("Phone not registered.");

        Customer customer = opt.get();
        customer.setPassword(password);
        customerRepository.save(customer);

        return ResponseEntity.ok("Password updated successfully.");
    }

    // ─────────────────────────────────────────────────────────────────────
    // 4. SEND LOGIN OTP — for "forgot password" / OTP fallback
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

        String masked = maskEmail(customer.getEmail());
        return ResponseEntity.ok(Map.of(
                "message", "OTP sent to " + masked,
                "maskedEmail", masked));
    }

    // ─────────────────────────────────────────────────────────────────────
    // 5. VERIFY LOGIN OTP — verify OTP and log in (forgot-password flow)
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
    // 6. RESEND OTP
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