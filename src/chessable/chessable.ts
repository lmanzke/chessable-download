import { getMoveFromText } from "@/chessable/utils";

const wait = (ms: number) => new Promise(resolve => {
  setTimeout(resolve, ms);
})

const waitForElement = async (selector: string, retries = 5): Promise<Element> => {
  if (retries === 0) {
    return Promise.reject(new Error('element not ready'));
  }

  const element = document.querySelector(selector);
  if (element) {
    return Promise.resolve(element);
  }

  await wait(500);
  return waitForElement(selector, retries > 0 ? retries - 1 : retries);
}

const getLetter = (str?: string) => {
  switch (str) {
    case 'knight': return 'N';
    case 'queen': return 'Q';
    case 'king': return 'K';
    case 'rook': return 'R';
    case 'bishop': return 'B';
    default:
      return '';
  }
}

type Move = {
  comment: string;
  move: string;
  moveNumber: number;
  parent?: Move,
  color: string,
  children: Move[];
}

const isWhiteMove = (theSpan: Element): boolean => {
  return theSpan.classList.contains('whiteMove')
};

const isBlackMove = (theSpan: Element): boolean => {
  return theSpan.classList.contains('blackMove')
};

const isMove = (theSpan: Element): boolean => {
  return isWhiteMove(theSpan) || isBlackMove(theSpan);
}

const isComment = (theSpan: Element): boolean => {
  return theSpan.classList.contains('commentInMove');
}

function createNode(move: string, moveNumber: number, color: string, parent?: Move, comment?: string): Move {
  return {
    move: move,
    moveNumber: moveNumber,
    comment: comment || '',
    parent,
    color,
    children: []
  };
}

const getMoveNumber = (currentMove?: Move) => {
  if (!currentMove) {
    return 1;
  }

  return currentMove.color === 'white' ? currentMove.moveNumber : currentMove.moveNumber + 1;
}

function createChild(move: string, currentMove?: Move, comment?: string): Move {
  return {
    move: move,
    color: currentMove?.color === 'white' ? 'black' : 'white',
    comment: comment || '',
    parent: currentMove,
    moveNumber: getMoveNumber(currentMove),
    children: []
  };
}

const isElement = (childNode: Node): childNode is HTMLElement => {
  return childNode.nodeType === Node.ELEMENT_NODE;
}

const isTextNode = (node?: Node): boolean => {
  if (!node) {
    return false;
  }

  return node.nodeType === Node.TEXT_NODE;
}

// Function to find the comment associated with a move
function findComment(span: HTMLElement) {
  const nextSiblings = span.nextElementSibling ? [span.nextElementSibling as HTMLElement] : [];
  const commentSpan = nextSiblings.find(sibling => sibling.classList.contains('commentInMove'));

  return commentSpan ? commentSpan.innerText.trim() : undefined;
}

function getFollowingSiblings(element: Element) {
  var siblings = [];
  var nextSibling = element.nextElementSibling;

  while (nextSibling) {
    siblings.push(nextSibling);
    nextSibling = nextSibling.nextElementSibling;
  }

  return siblings;
}

function processNextSiblings(span: HTMLElement, currentMove?: Move) {
  const siblings = getFollowingSiblings(span);

  const subMoves: Move[] = [];

  for (let i = 0; i < siblings.length; i++) {
    const childNode = siblings[i];

    if (
      isElement(childNode)
      && childNode.tagName.toLowerCase() === 'span'
      && childNode.classList.contains('commentMoveSmallMargin') 
      ) {
        const newMove = createChild(getMoveFromText(childNode.dataset.san || ''), currentMove);
        const nestedSubMoves = processNextSiblings(childNode, newMove);

        if (nestedSubMoves.length > 0) {
          newMove.children.push(...nestedSubMoves);
        }

        subMoves.push(newMove);
        break;
      } else if (isElement(childNode)
        && childNode.classList.contains('commentInVariation')) {
          
          const comment = childNode.innerText.trim() || '';
          if (currentMove) {
            currentMove.comment = comment;
          }
      }
  }

  return subMoves;
}

function findSubMoves(span: HTMLElement, currentMove?: Move) {
  const subMoves: Move[] = [];

  for (let i = 0; i < span.childNodes.length; i++) {
    const childNode = span.childNodes[i];

    if (
      isElement(childNode)
      && childNode.tagName.toLowerCase() === 'span'
      && childNode.classList.contains('commentMoveSmallMargin') 
      && childNode.dataset.mid === (currentMove?.moveNumber ?? 0 + 1).toString()
      ) {
      const newMove = createChild(getMoveFromText(childNode.dataset.san || ''), currentMove);
      const nestedSubMoves = processNextSiblings(childNode, newMove);

      if (nestedSubMoves.length > 0) {
        newMove.children.push(...nestedSubMoves);
      }

      subMoves.push(newMove);
    }
  }

  return subMoves;
}

function createMoveTree(spans: HTMLElement[]) {
  const moveTree: Move = createNode('root', 0, 'black');
  let currentNode = moveTree;

  for (let i = 0; i < spans.length; i++) {
    const span = spans[i];

    if (isMove(span)) {
      const pieceImage = span.querySelector('.commentMove__piece');
      let moveText = span.innerText.trim();
      const color = isBlackMove(span) ? 'black' : 'white';
      if (pieceImage instanceof HTMLElement) {
        moveText = getLetter(pieceImage.dataset.piece) + moveText;
      }

      moveText = getMoveFromText(moveText);

      const comment = findComment(span);

      const node = createChild(moveText, currentNode, comment);
      currentNode.children.push(node);

      currentNode = node;
    } else if (isComment(span)) {
      const comment = span.childNodes[0].textContent?.trim() || '';
      const subMoves = findSubMoves(span, currentNode.parent);

      if (subMoves.length > 0) {
        currentNode.parent?.children.push(...subMoves);
      }

      currentNode.comment = comment;
    }
  }

  return moveTree.children;
}

const getFormattedDate = (d: Date) => `${d.getFullYear()}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${(d.getDate() + 1).toString().padStart(2, '0')}`;

const getPGNMeta = (courseName: string) => {
  return [
    ['Event', courseName],
    ['Site', 'Online'],
    ['Date', getFormattedDate(new Date())],
    ['Round', 1],
    ['White', 'Training'],
    ['Black', 'Training'],
    ['Result', '*'],
  ];
}

const convertMoves = (moves: Move[]): string => {
  const [head, ...tail] = moves;

  let pgn = '';

  if (!head) {
    return pgn;
  }

  if (head.color === 'white') {
    pgn += head.moveNumber + '. ';
  }

  pgn += head.move;

  if (head.comment) {
    pgn += ` {${head.comment}}`;
  }

  if (tail.length > 0) {
    pgn += ' ';
    pgn += tail.map(v => `(${convertMoves([v])})`).join(' ')
  }

  if (head.children.length > 0) {
    pgn += ' ' + convertMoves(head.children);
  }

  return pgn;
} 

const getPGN = (courseName: string, moveList: Move[]) => {
  const metaText = getPGNMeta(courseName).map(([key, value]) => `[${key} "${value}"]`).join("\n");

  return metaText + "\n\n" + convertMoves(moveList) + ' *'
}

const toFileName = (s: string) => s.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.pgn';

function downloadFile(title: string, content: string) {
  const a = new Blob([content]);
  const aElement = document.createElement('a');
  aElement.setAttribute('download', toFileName(title));
  const href = URL.createObjectURL(a);
  aElement.href = href;
  aElement.setAttribute('target', '_blank');
  aElement.click();
  URL.revokeObjectURL(href);
}


const downloadPGN = (openingMoves: Element) => () => {
  const spans = openingMoves.querySelectorAll('span div.whiteMove, span div.blackMove, span.commentInMove');
  const title = document.querySelector('#theOpeningTitle')?.textContent || '';
  const pgn = getPGN(title, createMoveTree(Array.from(spans) as HTMLElement[]));

  downloadFile(title, pgn);
}

(async function () {
  const openingMoves = await waitForElement('#theOpeningMoves', -1);
  
  const button = document.createElement('button');
  button.appendChild(document.createTextNode('Download PGN'));
  button.classList.add('myButton', 'myButton--apple');
  button.style.margin = '16px 0';
  button.style.padding = '10px';
  button.onclick = downloadPGN(openingMoves);
  document.querySelector('.variation-header')?.after(button);
})().then(() => {
  console.log('done');
});

