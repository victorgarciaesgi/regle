import type {
  $InternalRegleCollectionErrors,
  $InternalRegleResult,
  $InternalRegleRuleStatus,
  RegleCommonStatus,
  RegleValidationErrors,
  RegleValidationGroupOutput,
} from '..';

/** Supports both core Regle and schemas Regle for Zod/Valibot */
export type SuperCompatibleRegleRoot = SuperCompatibleRegleStatus & {
  $groups?: { [x: string]: RegleValidationGroupOutput };
  $validate: () => Promise<SuperCompatibleRegleResult>;
};

export type SuperCompatibleRegleResult = $InternalRegleResult;

export interface SuperCompatibleRegleStatus extends SuperCompatibleRegleCommonStatus {
  $fields: {
    [x: string]: unknown;
  };
  readonly $errors: Record<string, RegleValidationErrors<any, false>>;
  readonly $silentErrors: Record<string, RegleValidationErrors<any, false>>;
  $extractDirtyFields: (filterNullishValues?: boolean) => Record<string, any>;
  $validate?: () => Promise<SuperCompatibleRegleResult>;
}
export type SuperCompatibleRegleRuleStatus = Omit<
  $InternalRegleRuleStatus,
  | '$haveAsync'
  | '$validating'
  | '$fieldDirty'
  | '$fieldInvalid'
  | '$fieldPending'
  | '$fieldCorrect'
  | '$fieldError'
  | '$unwatch'
  | '$watch'
>;

type SuperCompatibleRegleCommonStatus = Omit<RegleCommonStatus, '$pending'> & {
  $pending?: boolean;
};
export interface SuperCompatibleRegleFieldStatus extends SuperCompatibleRegleCommonStatus {
  $value: any;
  $silentValue: any;
  readonly $rules: Record<string, SuperCompatibleRegleRuleStatus>;
  readonly $externalErrors?: string[];
  readonly $errors: string[];
  readonly $inactive: boolean;
  readonly $silentErrors: string[];
  $extractDirtyFields: (filterNullishValues?: boolean) => any;
  $validate?: () => Promise<SuperCompatibleRegleResult>;
}
export interface SuperCompatibleRegleCollectionStatus
  extends Omit<SuperCompatibleRegleStatus, '$fields' | '$errors' | '$silentErrors'> {
  readonly $self: SuperCompatibleRegleFieldStatus;
  readonly $each: Array<SuperCompatibleRegleStatus | SuperCompatibleRegleFieldStatus>;
  readonly $errors: SuperCompatibleRegleCollectionErrors;
  readonly $silentErrors: SuperCompatibleRegleCollectionErrors;
  readonly $externalErrors?: string[];
  $extractDirtyFields: (filterNullishValues?: boolean) => any[];
  $validate?: () => Promise<SuperCompatibleRegleResult>;
}

export type SuperCompatibleRegleCollectionErrors = $InternalRegleCollectionErrors;
