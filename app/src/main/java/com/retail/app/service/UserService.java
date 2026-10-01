package com.retail.app.service;

import com.retail.app.dto.UserDTO;
import com.retail.app.entity.User;
import com.retail.app.enums.UserRole;
import com.retail.app.exception.BusinessValidationException;
import com.retail.app.exception.ResourceNotFoundException;
import com.retail.app.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<UserDTO> getAllUsers(UserRole role) {
        List<User> users;
        if (role != null) {
            users = userRepository.findByRole(role);
        } else {
            users = userRepository.findAll();
        }
        return users.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return mapToDTO(user);
    }

    @Transactional
    public UserDTO createUser(UserDTO dto) {
        String username = dto.getUsername().toLowerCase().trim();
        if (userRepository.existsByUsername(username)) {
            throw new BusinessValidationException("Username '" + username + "' is already taken");
        }
        if (userRepository.existsByEmail(dto.getEmail().toLowerCase().trim())) {
            throw new BusinessValidationException("Email '" + dto.getEmail() + "' is already registered");
        }

        User user = new User(
                username,
                dto.getFullName().trim(),
                dto.getEmail().toLowerCase().trim(),
                dto.getRole()
        );
        user.setActive(dto.isActive());

        User saved = userRepository.save(user);
        return mapToDTO(saved);
    }

    @Transactional
    public UserDTO updateUser(Long id, UserDTO dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        user.setFullName(dto.getFullName().trim());
        user.setRole(dto.getRole());
        user.setActive(dto.isActive());

        User updated = userRepository.save(user);
        return mapToDTO(updated);
    }

    public UserDTO mapToDTO(User u) {
        UserDTO dto = new UserDTO();
        dto.setId(u.getId());
        dto.setUsername(u.getUsername());
        dto.setFullName(u.getFullName());
        dto.setEmail(u.getEmail());
        dto.setRole(u.getRole());
        dto.setActive(u.isActive());
        dto.setCreatedAt(u.getCreatedAt());
        return dto;
    }
}
