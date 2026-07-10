package com.example.caterers.model;

import jakarta.persistence.*;

@Entity
@Table(name = "admin_credentials")
public class AdminCredentials {

    @Id
    private Long id = 1L; // Single row always

    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}