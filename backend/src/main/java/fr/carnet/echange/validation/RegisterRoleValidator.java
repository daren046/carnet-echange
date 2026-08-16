package fr.carnet.echange.validation;

import fr.carnet.echange.enums.UserRole;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class RegisterRoleValidator implements ConstraintValidator<AllowedRegisterRole, UserRole> {

    @Override
    public boolean isValid(UserRole role, ConstraintValidatorContext context) {
        if (role == null) {
            return false;
        }
        return role == UserRole.STUDENT || role == UserRole.PARENT;
    }
}
