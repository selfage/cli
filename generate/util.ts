let UPPER_CASES_REGEXP = /[A-Z]/;

export function generateComment(comment: string): string {
  if (comment) {
    return `\n/* ${comment} */`;
  } else {
    return "";
  }
}

export function toCapitalized(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function toUpperSnaked(name: string): string {
  let upperCaseSnakedName = name.charAt(0);
  for (let i = 1; i < name.length; i++) {
    let char = name.charAt(i);
    if (UPPER_CASES_REGEXP.test(char)) {
      upperCaseSnakedName += "_" + char;
    } else {
      upperCaseSnakedName += char.toUpperCase();
    }
  }
  return upperCaseSnakedName;
}
