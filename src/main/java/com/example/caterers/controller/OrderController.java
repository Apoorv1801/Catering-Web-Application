package com.example.caterers.controller;

import com.example.caterers.model.Order;
import com.example.caterers.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    public ResponseEntity<?> getOrder(@PathVariable Long id) {
        return orderRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody Order order) {
        if (order.getCustomerName() == null || order.getCustomerName().isBlank()) {
            return ResponseEntity.badRequest().body("Customer name is required.");
        }
        if (order.getPhone() == null || order.getPhone().length() < 10) {
            return ResponseEntity.badRequest().body("Valid phone number is required.");
        }
        if (order.getAddress() == null || order.getAddress().isBlank()) {
            return ResponseEntity.badRequest().body("Delivery address is required.");
        }
        if (order.getItems() == null || order.getItems().isBlank()) {
            return ResponseEntity.badRequest().body("Order items are required.");
        }
        if (order.getTotalAmount() <= 0) {
            return ResponseEntity.badRequest().body("Invalid order total.");
        }

        order.setStatus("Pending");
        Order saved = orderRepository.save(order);
        return ResponseEntity.ok(saved);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return orderRepository.findById(id).map(order -> {
            order.setStatus(status);
            orderRepository.save(order);
            return ResponseEntity.ok("Status updated to: " + status);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOrder(@PathVariable Long id) {
        if (!orderRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        orderRepository.deleteById(id);
        return ResponseEntity.ok("Order deleted successfully.");
    }
}