import {getVatNumberExempleByCountry} from '@malt/vue-custom-validators';
import type {RuleResultWithoutParams, RuleResultWithParams} from '@vuelidate/core';
import {CustomErrorMessage} from './types';

export interface DefaultValidators {
    /** Vuelidate validators */
    required: RuleResultWithoutParams | RuleResultWithParams<{prop: () => boolean}>;
    email: RuleResultWithoutParams;
    minLength: RuleResultWithParams<{min: number}>;
    maxLength: RuleResultWithParams<{max: number}>;
    minValue: RuleResultWithParams<{min: number}>;
    maxValue: RuleResultWithParams<{max: number}>;
    decimal: RuleResultWithoutParams;
    integer: RuleResultWithoutParams;
    numeric: RuleResultWithoutParams;
    sameAs: RuleResultWithParams<{equalTo: string; otherName: string}>;
    url: RuleResultWithoutParams;
    /** Custom */
    validRegistration: RuleResultWithParams<{countryCode?: string}>;
    validVatNumber: RuleResultWithParams<{countryCode?: string}>;
    validIban: RuleResultWithoutParams;
}

/**
 * ## Define the default validation error messages collection
 *
 * ### Only to use at core
 *
 * @param params the params provided by vuelidate when validating a field (`$v.value.field`)
 * @param _i18nService an custom I18nService to override the default one (If the translations come from ScreenMessages for exemple)
 * @returns a collection of errors messages for default validators
 */
export function defaultValidatorsErrorMessages(params: DefaultValidators): Record<keyof DefaultValidators, string | CustomErrorMessage> {
    const countryCode = params.validVatNumber?.$params.countryCode;
    const vatExemple = getVatNumberExempleByCountry(countryCode);

    /**
     * TODO
     * How to share default validators translation between apps
     *
     * */

    return {
        required: 'projectfreelancer.expenses.tracker.validations.errors.required',
        email: 'projectfreelancer.expenses.tracker.validations.errors.email',
        minLength: [`projectfreelancer.expenses.tracker.validations.errors.minLength`, {0: params.minLength?.$params.min}],
        maxLength: [`projectfreelancer.expenses.tracker.validations.errors.maxLength`, {0: params.minLength?.$params.min}],
        minValue: [`projectfreelancer.expenses.tracker.validations.errors.minValue`, {0: params.minValue?.$params.min}],
        maxValue: [`projectfreelancer.expenses.tracker.validations.errors.maxValue`, {0: params.maxValue?.$params.max}],
        decimal: 'The value must be decimal',
        integer: 'The value must be integer',
        numeric: 'projectfreelancer.expenses.tracker.validations.errors.numeric',
        sameAs: `The value must be the same as ${params.sameAs?.$params.equalTo}`,
        url: 'The value must be an url',
        validIban: 'Iban must be valid',
        validRegistration: 'Registration number must be valid',
        validVatNumber: `the vat number must be valid ${vatExemple ? `(ex: ${vatExemple})` : ''}`,
    };
}
