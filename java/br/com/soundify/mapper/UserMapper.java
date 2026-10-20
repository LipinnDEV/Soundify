package br.com.soundify.mapper;

import br.com.soundify.dto.UserResponse;
import br.com.soundify.entity.User;

public final class UserMapper {

    private UserMapper() {
    }

    public static UserResponse toResponse(User user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getCreatedAt());
    }
}
