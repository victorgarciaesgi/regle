import {BaseValidation, RuleResultWithParams} from '@vuelidate/core';
import * as AllDefaultValidators from '@vuelidate/validators';
import {unref} from 'vue';
import {DefaultValidators, defaultValidatorsErrorMessages} from './defaultValidators';
import {CustomErrorMessage, RuleResultRecord, ValidationError} from './types';
import {useTranslation} from '#imports';

export type ErrorFormaterFn<TCustomRules extends RuleResultRecord> = (
    params: DefaultValidators & TCustomRules,
) => Partial<Record<keyof DefaultValidators, CustomErrorMessage>> & Record<keyof TCustomRules, string | CustomErrorMessage>;

export function createErrorFormatter<TCustomRules extends RuleResultRecord>(errorFormater: ErrorFormaterFn<TCustomRules>) {
    /**
     * Return an array of translated error messages for a specific field
     * It's recommanded to use it when displaying error messages
     *
     * By default it will pick the global (default and custom) defined messages, but it can be overrided when using `withMessage`
     *
     * @param validation - The vuelidate related computed validation (ex: `$v.firstName`)
     * @returns A array of current errors messages
     */
    function formatErrorMessages(t: ReturnType<typeof useTranslation>['t'], validation?: BaseValidation): ValidationError<any> {
        if (validation && '$error' in validation && validation?.$error) {
            const $params = Object.fromEntries(Object.entries(validation).filter(([key]) => !key.startsWith('$') || key === '$each')) as
                | DefaultValidators & TCustomRules;

            const availableErrorMessages: Record<keyof (DefaultValidators & TCustomRules), string | CustomErrorMessage> = {
                ...defaultValidatorsErrorMessages($params),
                ...errorFormater($params),
                $each: '-',
            };

            // TODO collections handling
            const hasCollectionValidator = validation.$errors.some(({$message}) => Array.isArray($message));
            return validation.$errors.map(({$validator, $message}) => {
                function getValidatorMessage(customMessage: any, validator: string): string {
                    let isCustomMessage = false;
                    const allValidators = AllDefaultValidators as Record<string, any>;
                    const validatorParams = $params[$validator] as RuleResultWithParams;
                    if (validator === 'required') {
                        isCustomMessage =
                            allValidators[validator]?.$message !== customMessage &&
                            allValidators.requiredIf?.(false)?.$message !== customMessage &&
                            allValidators.requiredUnless?.(false)?.$message !== customMessage;
                    } else {
                        isCustomMessage =
                            allValidators[validator]?.$message !== customMessage &&
                            allValidators[validator]?.(false)?.$message !== customMessage &&
                            allValidators[validator]?.(false)?.$message(validatorParams) !== customMessage;
                    }

                    let finalMessage: CustomErrorMessage;

                    if (customMessage && isCustomMessage) {
                        if (typeof customMessage === 'function') {
                            finalMessage = customMessage({$params: validatorParams.$params});
                        }
                        finalMessage = unref(customMessage);
                    } else {
                        finalMessage = availableErrorMessages[$validator as keyof typeof availableErrorMessages];
                    }

                    if (Array.isArray(finalMessage)) {
                        return t(finalMessage[0], finalMessage[1]);
                    } else {
                        return t(finalMessage);
                    }
                }
                if (Array.isArray($message)) {
                    return {$each: $message.map((message: any) => getValidatorMessage(message, '$each'))[0]} as any;
                } else {
                    return getValidatorMessage($message, $validator);
                }
            });
        }
        return [];
    }

    return formatErrorMessages;
}
