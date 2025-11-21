export interface InspectorNodeTag {
  label: string;
  textColor: number;
  backgroundColor: number;
}

export interface InspectorTreeNode {
  id: string;
  label: string;
  tags?: InspectorNodeTag[];
  children?: InspectorTreeNode[];
}

export interface InspectorStateItem {
  key: string;
  value: unknown;
  editable: boolean;
}

export interface InspectorState {
  [section: string]: InspectorStateItem[];
}
