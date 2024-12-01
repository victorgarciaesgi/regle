import type { PartialDeep } from 'type-fest';

export type RegleErrorTree<TState = Record<string, any> | any[]> = {
  readonly [K in keyof TState]: RegleValidationErrors<TState[K]>;
};

export type RegleExternalErrorTree<TState = Record<string, any> | any[]> = PartialDeep<
  RegleErrorTree<TState>,
  { recurseIntoArrays: true }
>;

export type RegleValidationErrors<TState extends Record<string, any> | any[] | unknown = never> =
  NonNullable<TState> extends Array<infer U extends Record<string, any>>
    ? RegleCollectionErrors<U>
    : NonNullable<TState> extends Date | File
      ? string[]
      : NonNullable<TState> extends Record<string, any>
        ? RegleErrorTree<TState>
        : string[];

export type RegleCollectionErrors<TState extends Record<string, any>> = {
  readonly $errors: string[];
  readonly $each: RegleValidationErrors<TState>[];
};

/** @internal */
export type $InternalRegleCollectionErrors = {
  readonly $errors?: string[];
  readonly $each?: $InternalRegleErrors[];
};

export type $InternalRegleErrorTree = {
  [x: string]: $InternalRegleErrors;
};

/**
 * @internal
 */
export type $InternalRegleErrors =
  | $InternalRegleCollectionErrors
  | string[]
  | $InternalRegleErrorTree;

// - Misc

export type DataType =
  | string
  | number
  | Record<string, any>
  | File
  | Array<any>
  | Date
  | null
  | undefined;
