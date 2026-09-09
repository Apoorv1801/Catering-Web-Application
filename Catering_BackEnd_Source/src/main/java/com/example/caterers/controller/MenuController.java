package com.example.caterers.controller;

import com.example.caterers.model.Menu;
import com.example.caterers.repository.MenuRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/menu")
public class MenuController {

    @Autowired
    private MenuRepository menuRepository;

    // ADD FOOD
    @PostMapping("/upload")
    public String uploadFood(
            @RequestParam("name") String name,
            @RequestParam("price") int price,
            @RequestParam("category") String category,
            @RequestParam("description") String description,
            @RequestParam("events") String events,
            @RequestParam("image") MultipartFile file) {

        try {
            // File type validation
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null
                    ? originalFilename.toLowerCase().substring(originalFilename.lastIndexOf("."))
                    : "";

            List<String> allowed = List.of(".jpg", ".jpeg", ".png", ".webp", ".gif");
            if (!allowed.contains(extension)) {
                return "Only jpg, jpeg, png, webp, gif files are allowed.";
            }

            String uploadDir = System.getProperty("user.dir") + "/uploads/";
            File folder = new File(uploadDir);
            if (!folder.exists())
                folder.mkdirs();

            String fileName = System.currentTimeMillis() + "_" + originalFilename;
            File saveFile = new File(uploadDir + fileName);
            file.transferTo(saveFile);

            Menu menu = new Menu();
            menu.setName(name);
            menu.setPrice(price);
            menu.setCategory(category);
            menu.setDescription(description);
            menu.setEvents(events);
            menu.setImage("uploads/" + fileName);

            menuRepository.save(menu);
            return "Food added successfully";

        } catch (Exception e) {
            e.printStackTrace();
            return "Error adding food: " + e.getMessage();
        }
    }

    // GET ALL
    @GetMapping
    public List<Menu> getMenu() {
        return menuRepository.findAll();
    }

    // GET BY EVENT (e.g. /menu/event/Wedding)
    @GetMapping("/event/{event}")
    public List<Menu> getByEvent(@PathVariable String event) {
        return menuRepository.findAll().stream()
                .filter(m -> m.getEvents() != null &&
                        List.of(m.getEvents().split(","))
                                .stream()
                                .map(String::trim)
                                .anyMatch(e -> e.equalsIgnoreCase(event)))
                .toList();
    }

    // GET BY EVENT + CATEGORY (e.g. /menu/event/Wedding/category/Starter)
    @GetMapping("/event/{event}/category/{category}")
    public List<Menu> getByEventAndCategory(@PathVariable String event, @PathVariable String category) {
        return menuRepository.findAll().stream()
                .filter(m -> m.getEvents() != null &&
                        List.of(m.getEvents().split(","))
                                .stream()
                                .map(String::trim)
                                .anyMatch(e -> e.equalsIgnoreCase(event)))
                .filter(m -> m.getCategory() != null &&
                        m.getCategory().equalsIgnoreCase(category))
                .toList();
    }

    // DELETE
    @DeleteMapping("/delete/{id}")
    public String deleteFood(@PathVariable Long id) {
        try {
            menuRepository.deleteById(id);
            return "Food deleted successfully";
        } catch (Exception e) {
            return "Error deleting food";
        }
    }
}