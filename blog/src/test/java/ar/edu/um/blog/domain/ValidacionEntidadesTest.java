package ar.edu.um.blog.domain;

import static org.assertj.core.api.Assertions.assertThat;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import java.time.Instant;
import java.util.Set;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * Tests de unidad de las reglas de validación definidas en el modelo JDL (blog.jh).
 * No levantan Spring ni la base de datos: usan directamente el validador de Bean Validation.
 */
class ValidacionEntidadesTest {

    private static ValidatorFactory factory;
    private static Validator validator;

    @BeforeAll
    static void crearValidador() {
        factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @AfterAll
    static void cerrarValidador() {
        factory.close();
    }

    @Test
    @DisplayName("Un Post sin título no es válido (title String required)")
    void postSinTituloNoEsValido() {
        Post post = new Post().content("Contenido de prueba").date(Instant.now());

        Set<ConstraintViolation<Post>> errores = validator.validate(post);

        assertThat(errores).hasSize(1);
        assertThat(errores.iterator().next().getPropertyPath()).hasToString("title");

        post.title("Mi primer post");
        assertThat(validator.validate(post)).isEmpty();
    }

    @Test
    @DisplayName("Un Blog con nombre de menos de 3 caracteres no es válido (name minlength(3))")
    void blogConNombreCortoNoEsValido() {
        Blog blog = new Blog().name("ab").handle("ab");

        Set<ConstraintViolation<Blog>> errores = validator.validate(blog);

        assertThat(errores).hasSize(1);
        assertThat(errores.iterator().next().getPropertyPath()).hasToString("name");

        blog.name("abc");
        assertThat(validator.validate(blog)).isEmpty();
    }
}
