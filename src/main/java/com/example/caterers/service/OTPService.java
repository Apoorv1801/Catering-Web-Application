package com.example.caterers.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OTPService {

    // OTP expires after 5 minutes
    private static final long OTP_VALIDITY_SECONDS = 300;

    @Autowired
    private JavaMailSender mailSender;

    // Stores: email -> [otp, expiryEpochSecond]
    private final Map<String, long[]> otpStore = new ConcurrentHashMap<>();

    /**
     * Generates a 6-digit OTP, stores it, and sends it to the given email.
     */
    public void generateAndSend(String email, String recipientName) {
        String otp = String.format("%06d", new SecureRandom().nextInt(1_000_000));
        long expiry = Instant.now().getEpochSecond() + OTP_VALIDITY_SECONDS;
        otpStore.put(email.toLowerCase(), new long[]{Long.parseLong(otp), expiry});

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Your Royal Caterers OTP");
        message.setText(
            "Hello " + recipientName + ",\n\n" +
            "Your OTP for Royal Caterers is: " + otp + "\n\n" +
            "This OTP is valid for 5 minutes. Do not share it with anyone.\n\n" +
            "Regards,\nRoyal Caterers"
        );
        mailSender.send(message);
    }

    /**
     * Returns true if the OTP matches and has not expired. Clears it on success.
     */
    public boolean verify(String email, String inputOtp) {
        long[] stored = otpStore.get(email.toLowerCase());
        if (stored == null) return false;

        long storedOtp = stored[0];
        long expiry    = stored[1];

        if (Instant.now().getEpochSecond() > expiry) {
            otpStore.remove(email.toLowerCase());
            return false;
        }

        if (String.valueOf(storedOtp).equals(inputOtp.trim())) {
            otpStore.remove(email.toLowerCase());
            return true;
        }
        return false;
    }
}
