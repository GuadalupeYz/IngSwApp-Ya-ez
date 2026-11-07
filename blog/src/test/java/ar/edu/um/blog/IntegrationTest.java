package ar.edu.um.blog;

import ar.edu.um.blog.config.AsyncSyncConfiguration;
import ar.edu.um.blog.config.EmbeddedSQL;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * Base composite annotation for integration tests.
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@SpringBootTest(classes = { BlogApp.class, AsyncSyncConfiguration.class, ar.edu.um.blog.config.JacksonHibernateConfiguration.class })
@EmbeddedSQL
public @interface IntegrationTest {}
