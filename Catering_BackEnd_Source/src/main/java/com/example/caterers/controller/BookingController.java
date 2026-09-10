package com.example.caterers.controller;

import com.example.caterers.model.Booking;
import com.example.caterers.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/booking")
public class BookingController {

    @Autowired
    private BookingRepository bookingRepository;

    @GetMapping
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getBookingById(@PathVariable Long id) {
        Optional<Booking> booking = bookingRepository.findById(id);
        return booking.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody Booking booking) {

        // ── Name ──────────────────────────────────────────────────────────
        if (booking.getName() == null || booking.getName().isBlank())
            return ResponseEntity.badRequest().body("Name is required.");
        if (booking.getName().trim().length() < 2)
            return ResponseEntity.badRequest().body("Name must be at least 2 characters.");
        if (booking.getName().trim().length() > 60)
            return ResponseEntity.badRequest().body("Name must not exceed 60 characters.");

        // ── Email ─────────────────────────────────────────────────────────
        if (booking.getEmail() == null || booking.getEmail().isBlank())
            return ResponseEntity.badRequest().body("Email is required.");
        if (!booking.getEmail().contains("@") || !booking.getEmail().contains("."))
            return ResponseEntity.badRequest().body("Enter a valid email address.");

        // ── Phone ─────────────────────────────────────────────────────────
        if (booking.getPhone() == null || booking.getPhone().isBlank())
            return ResponseEntity.badRequest().body("Phone number is required.");
        String phone = booking.getPhone().replaceAll("\\s+", "");
        if (!phone.matches("[6-9][0-9]{9}"))
            return ResponseEntity.badRequest().body("Enter a valid 10-digit Indian mobile number starting with 6-9.");

        // ── Event type ────────────────────────────────────────────────────
        if (booking.getEventType() == null || booking.getEventType().isBlank())
            return ResponseEntity.badRequest().body("Event type is required.");

        // ── Guests ────────────────────────────────────────────────────────
        if (booking.getGuests() < 10)
            return ResponseEntity.badRequest().body("Minimum 10 guests required for catering.");
        if (booking.getGuests() > 1499)
            return ResponseEntity.badRequest().body("Maximum 1499 guests allowed per booking.");

        // ── Date ──────────────────────────────────────────────────────────
        if (booking.getEventDate() == null)
            return ResponseEntity.badRequest().body("Event date is required.");

        LocalDate today   = LocalDate.now();
        LocalDate minDate = today.plusDays(3);
        LocalDate maxDate = today.plusMonths(1);

        if (booking.getEventDate().isBefore(minDate))
            return ResponseEntity.badRequest().body("Event must be booked at least 3 days in advance.");
        if (booking.getEventDate().isAfter(maxDate))
            return ResponseEntity.badRequest().body("Event must be within 1 month from today.");

        // ── Special requests ──────────────────────────────────────────────
        if (booking.getSpecialRequests() != null && booking.getSpecialRequests().length() > 500)
            return ResponseEntity.badRequest().body("Special requests must not exceed 500 characters.");

        Booking saved = bookingRepository.save(booking);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBooking(@PathVariable Long id) {
        if (!bookingRepository.existsById(id))
            return ResponseEntity.notFound().build();
        bookingRepository.deleteById(id);
        return ResponseEntity.ok("Booking deleted.");
    }
}
