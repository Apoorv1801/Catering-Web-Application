package com.example.caterers.controller;

import com.example.caterers.model.Booking;
import com.example.caterers.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

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
    public ResponseEntity<?> getBooking(@PathVariable Long id) {
        return bookingRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody Booking booking) {
        LocalDate today = LocalDate.now();
        LocalDate maxAllowed = today.plusDays(90);
        LocalDate eventDate = booking.getEventDate();

        if (eventDate == null) {
            return ResponseEntity.badRequest().body("Event date is required.");
        }

        if (eventDate.isBefore(today.plusDays(3))) {
            return ResponseEntity.badRequest().body("Event date must be at least 3 days in advance.");
        }

        if (eventDate.isAfter(maxAllowed)) {
            return ResponseEntity.badRequest().body("Event date must be within the next 90 days.");
        }

        Booking savedBooking = bookingRepository.save(booking);
        return ResponseEntity.ok(savedBooking);
    }

    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBooking(@PathVariable Long id) {
        if (!bookingRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        bookingRepository.deleteById(id);
        return ResponseEntity.ok("Booking deleted successfully.");
    }
}