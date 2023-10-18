export interface RegleBehaviourOptions {
  /**
   * Only display error when calling `validateForm()`
   * @default false
   */
  lazy?: boolean;
  /**
   * Automaticaly set the dirty set without the need of `$value` or `$touch`
   * @default true
   */
  autoDirty?: boolean;
  /**
   * The fields will turn valid when they are, but not invalid unless calling `validateForm()`
   * @default false
   */
  rewardEarly?: boolean;
}
