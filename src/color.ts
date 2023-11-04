const Color_Off = "\x1B[0m";
const Green = "\x1B[0;32m";
const Yellow = "\x1B[0;33m";
const RedBg = "\x1B[41m";

export function green(text: string) {
  return `${Green}${text}${Color_Off}`;
}

export function yellow(text: string) {
  return `${Yellow}${text}${Color_Off}`;
}

export function mention(text: string, nickname?: string) {
  if (!nickname) return text;
  return text.replace(`@${nickname}`, `${RedBg}@${nickname}${Color_Off}`);
}
