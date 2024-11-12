import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from "class-validator";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";

@ValidatorConstraint({ async: true })
export class IsUniqueEmail implements ValidatorConstraintInterface {
    async validate(email: string, args: ValidationArguments) {
        const userRepository = AppDataSource.getRepository(User);
        // @ts-ignore
        const user = await userRepository.findOne({ where: { _email: email } });
        return !user;
    }

    defaultMessage(args: ValidationArguments) {
        return `Email ${args.value} is already taken`;
    }
}
