const moveRegex = /^(?<move>([a-hBQKNR]*[x]*[a-h]+[1-8]+|0-0-0|0-0)[#+]{0,1})(?<annotation>.*)$/;

export const getMoveFromText = (text: string) => {
  const matches = text.replaceAll('O', '0').match(moveRegex);
  if (!matches || !matches.groups) {
    return '';
  }
  
  const { move } = matches.groups;

  return move;
}
