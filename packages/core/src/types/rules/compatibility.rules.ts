import type {
  $InternalRegleCollectionErrors,
  $InternalRegleCollectionIssues,
  $InternalRegleResult,
  $InternalRegleRuleStatus,
  RegleBehaviourOptions,
  RegleCommonStatus,
  RegleFieldIssue,
  RegleValidationErrors,
  RegleValidationGroupOutput,
  ResetOptions,
} from '..';

export type RegleLike<TState extends Record<string, any>> = {
  $value: TState;
  $validate: (...args: any[]) => Promise<SuperCompatibleRegleResult>;
};

export interface SuperCompatibleRegle {
  r$: SuperCompatibleRegleRoot;
}

/** Supports both core Regle and schemas Regle for Zod/Valibot */
export type SuperCompatibleRegleRoot = SuperCompatibleRegleStatus & {
  $groups?: { [x: string]: RegleValidationGroupOutput };
  $validate: (...args: any[]) => Promise<SuperCompatibleRegleResult>;
  '~modifiers'?: RegleBehaviourOptions;
};

export type SuperCompatibleRegleResult = $InternalRegleResult;

export type SuperCompatibleRegleStatus = {
  readonly $fields: {
    [x: string]: any;
  };
  readonly $issues: Record<string, RegleValidationErrors<any, false, true>>;
  readonly $errors: Record<string, RegleValidationErrors<any, false>>;
  readonly $silentErrors: Record<string, RegleValidationErrors<any, false>>;
  $extractDirtyFields: (filterNullishValues?: boolean) => Record<string, any>;
  $validate?: () => Promise<SuperCompatibleRegleResult>;
  $reset: (options?: ResetOptions<unknown>) => void;
  [x: string]: any;
};

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
  | '$maybePending'
>;

type SuperCompatibleRegleCommonStatus = Omit<RegleCommonStatus, '$pending'> & {
  $pending?: boolean;
};
export interface SuperCompatibleRegleFieldStatus extends SuperCompatibleRegleCommonStatus {
  $value: any;
  $silentValue: any;
  readonly $rules: Record<string, SuperCompatibleRegleRuleStatus>;
  readonly $externalErrors?: string[];
  readonly $issues: RegleFieldIssue[];
  readonly $silentIssues: RegleFieldIssue[];
  readonly $errors: string[];
  readonly $inactive: boolean;
  readonly $silentErrors: string[];
  $extractDirtyFields: (filterNullishValues?: boolean) => any;
  $validate?: () => Promise<SuperCompatibleRegleResult>;
}
export interface SuperCompatibleRegleCollectionStatus
  extends Omit<SuperCompatibleRegleStatus, '$fields' | '$issues' | '$errors' | '$silentErrors'> {
  readonly $self: SuperCompatibleRegleFieldStatus;
  readonly $each: Array<SuperCompatibleRegleStatus | SuperCompatibleRegleFieldStatus>;
  readonly $issues: SuperCompatibleRegleCollectionIssues;
  readonly $errors: SuperCompatibleRegleCollectionErrors;
  readonly $silentErrors: SuperCompatibleRegleCollectionErrors;
  readonly $externalErrors?: string[];
  $extractDirtyFields: (filterNullishValues?: boolean) => any[];
  $validate?: () => Promise<SuperCompatibleRegleResult>;
}

export type SuperCompatibleRegleCollectionErrors = $InternalRegleCollectionErrors;
export type SuperCompatibleRegleCollectionIssues = $InternalRegleCollectionIssues;
