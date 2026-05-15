package com.fifa2026.prode.controller;

import com.fifa2026.prode.dto.UserDTO;
import com.fifa2026.prode.entity.User;
import com.fifa2026.prode.repository.UserRepository;
import com.fifa2026.prode.service.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser() {
        User user = currentUserService.getCurrentUser();
        return ResponseEntity.ok(UserDTO.fromEntity(user));
    }

    @PutMapping("/me")
    public ResponseEntity<UserDTO> updateProfile(@RequestBody UserDTO updateRequest) {
        User user = currentUserService.getCurrentUser();

        if (updateRequest.getDisplayName() != null) {
            user.setDisplayName(updateRequest.getDisplayName());
        }
        if (updateRequest.getAvatarUrl() != null) {
            user.setAvatarUrl(updateRequest.getAvatarUrl());
        }
        if (updateRequest.getRegion() != null) {
            try {
                user.setRegion(User.Region.valueOf(updateRequest.getRegion()));
            } catch (IllegalArgumentException e) {
                // Invalid region, ignore
            }
        }

        user = userRepository.save(user);
        return ResponseEntity.ok(UserDTO.fromEntity(user));
    }
}
