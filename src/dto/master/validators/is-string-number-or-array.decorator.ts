import { ValidationOptions, registerDecorator } from 'class-validator';

export function IsStringNumberOrArray(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isStringNumberOrArray',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          const isStringOrNumber = (item: unknown) =>
            typeof item === 'string' || typeof item === 'number';

          return (
            isStringOrNumber(value) ||
            (Array.isArray(value) && value.every(isStringOrNumber))
          );
        },
        defaultMessage() {
          return '$property must be a string, number, or an array of strings and numbers';
        },
      },
    });
  };
}