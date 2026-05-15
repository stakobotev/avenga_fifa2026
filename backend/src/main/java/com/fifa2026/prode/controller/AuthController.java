package com.fifa2026.prode.controller;

import com.fifa2026.prode.dto.UserDTO;
import com.fifa2026.prode.entity.User;
import com.fifa2026.prode.service.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Profile("prod")
public class AuthController {

    private final CurrentUserService currentUserService;

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser() {
        User user = currentUserService.getCurrentUser();
        return ResponseEntity.ok(UserDTO.fromEntity(user));
    }
}
