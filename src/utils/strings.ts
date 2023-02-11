export function random(
  length: number
): string {
  let text = '';
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  possible += 'abcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}