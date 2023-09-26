import {computed, ComputedRef, MaybeRef, ref} from 'vue';
import {DefaultValidators} from './defaultValidators';
import {createErrorFormatter} from './formatErrorMessages';
import {CustomErrorMessage, PartialValidationTree, RuleResultRecord} from './types';
import {createUseFormComposable} from './useForm';

/**
 * Root function that allows you to define project-wise all your custom validators and their error messages
 *
 * It will return utility functions that let you build type-safe forms
 *
 * @param errorFormater
 * @param _i18nService
 */
export function defineCustomValidators<TCustomRules extends RuleResultRecord>(
    errorFormater: (
        params: DefaultValidators & TCustomRules,
    ) => Partial<Record<keyof DefaultValidators, CustomErrorMessage>> & Record<keyof TCustomRules, CustomErrorMessage>,
) {
    /**
     * Create a reactive typed state for your form, export the state and a rules setter
     *
     * @param initialState - initial state of your form. It can be based on reactive values to be recollected at reset
     */
    function createState<TData extends Record<string, any>>(initialState: MaybeRef<TData>) {
        const state = ref(initialState);

        function setRules<T extends PartialValidationTree<TData, TCustomRules>>(factory: () => T): ComputedRef<T> {
            return computed(factory);
        }

        return {
            state,
            setRules,
        };
    }

    const formatErrorMessages = createErrorFormatter<TCustomRules>(errorFormater);
    const useForm = createUseFormComposable<TCustomRules>(formatErrorMessages);

    return {
        formatErrorMessages,
        useForm,
    };
}
