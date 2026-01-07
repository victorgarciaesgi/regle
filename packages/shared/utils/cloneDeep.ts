function getRegExpFlags(regExp: any) {
  let flags = [];
  regExp.global && flags.push('g');
  regExp.ignoreCase && flags.push('i');
  regExp.multiline && flags.push('m');
  regExp.sticky && flags.push('y');
  regExp.unicode && flags.push('u');
  return flags.join('');
}

export function cloneDeep<T>(obj: T, dep = 0): T {
  if (dep > 20) {
    // Avoid infinite recursion in recursive objects
    return obj;
  }
  let result = obj as any;
  let type = {}.toString.call(obj).slice(8, -1);
  if (type == 'Set') {
    result = new Set([...(obj as any)].map((value) => cloneDeep(value, dep++)));
  }
  if (type == 'Map') {
    result = new Map([...(obj as any)].map((kv) => [cloneDeep(kv[0]), cloneDeep(kv[1])]));
  }
  if (type == 'Date') {
    result = new Date((obj as any).getTime());
  }
  if (type == 'RegExp') {
    result = RegExp((obj as any).source, getRegExpFlags(obj));
  }
  if (type == 'Array' || type == 'Object') {
    result = Array.isArray(obj) ? [] : {};
    for (let key in obj) {
      // include prototype properties
      result[key] = cloneDeep(obj[key], dep++);
    }
  }

  // primitives and non-supported objects (e.g. functions) land here
  return result;
}
