export const REQUEST_ID_LENGTH = 20;

const REQUEST_ID_REGEX = /^\d{1,20}$/;

export function isValidRequestId(value: string): boolean {
  return REQUEST_ID_REGEX.test(value);
}

export const REQUEST_ID_EXAMPLE = "12345";

export const REQUEST_ID_PLACEHOLDER = "1";
