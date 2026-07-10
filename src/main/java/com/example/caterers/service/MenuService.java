package com.example.caterers.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.caterers.model.Menu;
import com.example.caterers.repository.MenuRepository;

@Service
public class MenuService {

    @Autowired
    private MenuRepository repo;

    public List<Menu> getAllMenu() {
        return repo.findAll();
    }

    public Menu addFood(Menu food) {
        return repo.save(food);
    }

    public void deleteFood(Long id) {
        repo.deleteById(id);
    }

}