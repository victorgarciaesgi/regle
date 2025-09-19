export type $InternalRegleResult = { valid: boolean; data: any; errors: any; issues: any };

export type RegleSchemaBehaviourOptions = {
  /**
   * Settings for applying transforms and default to the current state
   */
  syncState?: {
    /**
     * Applies every transform on every update to the state
     */
    onUpdate?: boolean;
    /**
     * Applies every transform only when calling `$validate`
     */
    onValidate?: boolean;
  };
};
