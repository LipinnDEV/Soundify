package br.com.soundify.service;

import br.com.soundify.dto.UpdateProfileRequest;
import br.com.soundify.dto.UserResponse;
import br.com.soundify.entity.User;
import br.com.soundify.exception.ConflictException;
import br.com.soundify.exception.ResourceNotFoundException;
import br.com.soundify.mapper.UserMapper;
import br.com.soundify.repository.UserRepository;
import br.com.soundify.util.Texts;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository users;

    public UserService(UserRepository users) {
        this.users = users;
    }

    public UserResponse getProfile(Long userId) {
        return UserMapper.toResponse(find(userId));
    }

    @Transactional
    public UserResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = find(userId);
        String email = Texts.normalize(request.email());
        if (users.existsByEmailIgnoreCaseAndIdNot(email, userId)) {
            throw new ConflictException("Este e-mail já está em uso por outra conta.");
        }
        user.setName(request.name().trim());
        user.setEmail(email);
        return UserMapper.toResponse(user); // a entidade é gerenciada: o JPA grava a alteração ao concluir a transação
    }

    private User find(Long userId) {
        return users.findById(userId).orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));
    }
}
