export type RegleSchemaMode = 'rules' | 'schema';
export type isModeRules<T> = T extends 'rules' ? true : false;

export type $InternalRegleResult = { valid: boolean; data: any };
