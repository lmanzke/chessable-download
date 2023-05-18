import { getMoveFromText } from '@/chessable/utils';

describe('getMoveFromText', () => {
    it('should work', () => {
        expect(getMoveFromText('a4')).toEqual('a4');
        expect(getMoveFromText('h3!')).toEqual('h3');
        expect(getMoveFromText('Nf1?')).toEqual('Nf1');
        expect(getMoveFromText('Rhh2#')).toEqual('Rhh2#');
        expect(getMoveFromText('Rhh2+!')).toEqual('Rhh2+');
    })
});