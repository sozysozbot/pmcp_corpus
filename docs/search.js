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

function search() {
    document.getElementById("results-section").innerHTML = JSON.stringify(get_matches(), 2, null);
}

