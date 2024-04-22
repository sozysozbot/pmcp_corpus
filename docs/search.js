function get_matches() {
    const string = "cecnutit";

    return CORPUS.filter(item => item.pmcp.includes(string)).map(item => {
        const matched_portions = [];
        /* 
        g - global 
        i - case insensitive
        d - get the indices */
        const myRe = /cecnutit/gid;
        let myArray;
        while ((myArray = myRe.exec(item.pmcp)) !== null) {
            matched_portions.push({
                match: myArray[0],
                beginIndex: myArray.indices[0][0],
                endIndex: myRe.lastIndex
            });
        }
        return { item, matched_portions };
    });
}

function display_result() {
    const items = get_matches()
    /*
    Each item is of the following form:
    {"item":{"source":"プロパガンダかるた","pmcp":"icco cecnutit lata pi lata cecnutit icco","direct_ja":"","ja":"国が人を守り、人が国を守る","en":""},"matched_portions":[{"match":"cecnutit","beginIndex":5,"endIndex":13},{"match":"cecnutit","beginIndex":27,"endIndex":35}]}

    I would like to turn this into
    <div class="searched-item">
        <div class="corpus-text">icco <strong class="matched-portion">cecnutit</strong> lata pi lata cecnutit icco</div>
        <div class="translation-ja">国が人を守り、人が国を守る</div>
      </div>
      <div class="searched-item">
        <div class="corpus-text">icco cecnutit lata pi lata <strong class="matched-portion">cecnutit</strong> icco</div>
        <div class="translation-ja">国が人を守り、人が国を守る</div>
      </div>
    */
    document.getElementById("results-section").innerHTML = "/* todo */";
}

