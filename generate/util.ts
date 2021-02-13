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
  let upperCaseSnakedName = new Array<string>();
  upperCaseSnakedName.push(name.charAt(0));
  for (let i = 1; i < name.length; i++) {
    let char = name.charAt(i);
    if (UPPER_CASES_REGEXP.test(char)) {
      upperCaseSnakedName.push("_", char);
    } else {
      upperCaseSnakedName.push(char.toUpperCase());
    }
  }
  return upperCaseSnakedName.join("");
}

// Given a possible resolved relative path, return the relative path compliant
// with Nodejs module resolution, i.e., must start with `./` or `../`.
export function getNodeRelativePath(relativePath: string): string {
  if (relativePath.startsWith("../") || relativePath.startsWith("./")) {
    return relativePath;
  } else {
    return "./" + relativePath;
  }
}
