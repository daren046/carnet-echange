package fr.carnet.echange.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Target({ ElementType.FIELD, ElementType.PARAMETER })
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = RegisterRoleValidator.class)
@Documented
public @interface AllowedRegisterRole {
    String message() default "Seuls les profils Élève, Parent et Vendeur sont autorisés à l'inscription";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
