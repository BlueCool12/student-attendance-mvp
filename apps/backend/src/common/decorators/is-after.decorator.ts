import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsAfter(property: string, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isAfter',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as Record<string, unknown>)[relatedPropertyName];
          if (!value || !relatedValue) return true;
          return new Date(value as string) >= new Date(relatedValue as string);
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          return `$property must be after or equal to ${relatedPropertyName}`;
        },
      },
    });
  };
}
