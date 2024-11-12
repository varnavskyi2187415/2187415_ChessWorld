import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { User } from '../entity/User';
import { AppDataSource } from '../data-source';

@ValidatorConstraint({ async: true })
export class IsEmailAlreadyExistConstraint implements ValidatorConstraintInterface {
    async validate(email: any) {
        const userRepository = AppDataSource.getRepository(User);
        // @ts-ignore
        const user = await userRepository.findOneBy({ _email: email });
        return !user;
    }

    defaultMessage() {
        return 'Email $value is already in use';
    }
}

export function IsUniqueEmail(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsEmailAlreadyExistConstraint,
        });
    };
}
