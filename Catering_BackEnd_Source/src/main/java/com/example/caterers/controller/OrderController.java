package com.example.caterers.controller;

import com.example.caterers.model.Order;
import com.example.caterers.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/orders")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @GetMapping
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable Long id) {
        Optional<Order> order = orderRepository.findById(id);
        return order.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody Order order) {

        // ── Name ──────────────────────────────────────────────────────────
        if (isBlank(order.getCustomerName()))
            return ResponseEntity.badRequest().body("Customer name is required.");
        if (order.getCustomerName().trim().length() < 2)
            return ResponseEntity.badRequest().body("Name must be at least 2 characters.");
        if (order.getCustomerName().trim().length() > 60)
            return ResponseEntity.badRequest().body("Name must not exceed 60 characters.");

        // ── Phone ─────────────────────────────────────────────────────────
        if (isBlank(order.getPhone()))
            return ResponseEntity.badRequest().body("Phone number is required.");
        String phone = order.getPhone().replaceAll("\\s+", "");
        if (!phone.matches("[6-9][0-9]{9}"))
            return ResponseEntity.badRequest().body("Enter a valid 10-digit Indian mobile number starting with 6-9.");

        // ── Address ───────────────────────────────────────────────────────
        if (isBlank(order.getAddress()))
            return ResponseEntity.badRequest().body("Delivery address is required.");
        if (order.getAddress().trim().length() < 10)
            return ResponseEntity.badRequest().body("Please enter a complete delivery address (at least 10 characters).");
        if (order.getAddress().trim().length() > 300)
            return ResponseEntity.badRequest().body("Address must not exceed 300 characters.");

        // ── Items ─────────────────────────────────────────────────────────
        if (isBlank(order.getItems()))
            return ResponseEntity.badRequest().body("Order must have at least one item.");

        // ── Total ─────────────────────────────────────────────────────────
        if (order.getTotalAmount() <= 0)
            return ResponseEntity.badRequest().body("Invalid order total.");

        order.setStatus("Pending");
        Order saved = orderRepository.save(order);
        return ResponseEntity.ok(saved);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestParam String status) {
        List<String> validStatuses = List.of("Pending", "Confirmed", "Delivered", "Cancelled");
        if (!validStatuses.contains(status))
            return ResponseEntity.badRequest().body("Invalid status value.");

        return orderRepository.findById(id)
                .map(order -> {
                    order.setStatus(status);
                    return ResponseEntity.ok(orderRepository.save(order));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOrder(@PathVariable Long id) {
        if (!orderRepository.existsById(id))
            return ResponseEntity.notFound().build();
        orderRepository.deleteById(id);
        return ResponseEntity.ok("Order deleted.");
    }

    private boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}
