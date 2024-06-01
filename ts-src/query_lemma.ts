const words = WORDS.filter(w => !w.目録から排除);

// 実際には無い語形も登場する、緩めのリスト
const loose_list = words
    .map(w => w.語.toLowerCase())
    .flatMap(phrase => phrase.split(/[^a-z]/))
    .flatMap(word => {
        if (word.endsWith("it") && word.length > 2) {
            return [word, word.slice(0, -2)];
        } else if (word !== "moleti" && word.endsWith("leti") && word.length > 4) {
            return [word, word.slice(0, -4)];
        } else {
            return [word];
        }
    })
    ;

loose_list.sort();

function queryLemma(word: string, allow_strip: boolean): Word | null {
    if (allow_strip) {
        if (word.endsWith("it") && word.length > 2 && queryLemma(word.slice(0, -2), false)) {
            return queryLemma(word.slice(0, -2), false);
        } else if (word !== "moleti" && word.endsWith("leti") && word.length > 4 && queryLemma(word.slice(0, -4), false)) {
            return queryLemma(word.slice(0, -4), false);
        }
    }

    if (
        loose_list.indexOf(word) !== loose_list.lastIndexOf(word)
    ) {
        // not unique; not yet handlable
        return null;
    } else {
        const filtered = words.filter(w => w.語.toLowerCase().split(/[^a-z]/).includes(word));
        if (filtered.length > 0) {
            return filtered[0];
        }
    }
    return null;
}