package br.com.soundify.exception;

/** Conflito com o estado atual dos dados, como e-mail já cadastrado (HTTP 409). */
public class ConflictException extends RuntimeException {

    public ConflictException(String message) {
        super(message);
    }
}
