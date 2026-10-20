package br.com.soundify.exception;

/** Usuário autenticado tentando mexer em algo que não é dele (HTTP 403). */
public class ForbiddenOperationException extends RuntimeException {

    public ForbiddenOperationException(String message) {
        super(message);
    }
}
