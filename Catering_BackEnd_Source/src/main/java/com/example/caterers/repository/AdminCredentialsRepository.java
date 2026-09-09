package com.example.caterers.repository;

import com.example.caterers.model.AdminCredentials;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminCredentialsRepository extends JpaRepository<AdminCredentials, Long> {
}