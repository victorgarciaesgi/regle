export type RegleSchemaMode = 'rules' | 'schema';
export type isModeRules<T> = T extends 'rules' ? true : false;

export type RegleSchemaModeOptions<T extends RegleSchemaMode = 'rules'> = {
  mode?: T;
};

export type $InternalRegleResult = { result: boolean; data: any };
