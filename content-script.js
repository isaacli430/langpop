function htmlSafe(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * 
        charactersLength));
    }
    return result;
}

function clickButton() {
    chrome.storage.local.get(['input'], function (result) {
        
        options = {
            method: 'POST',
            body: JSON.stringify({"text": result.input})
        }

        fetch("https://us-central1-academic-pier-319603.cloudfunctions.net/translate", options).then(res => res.text()).then(res => $("#translateguessresult").html(`<b>Translation</b><br><span id='translationresult'>${htmlSafe(res)}</span>`))
    })

    $("#translateguessresult").show()
    $("#translateguessresult").html("<b>Translation</b><br><span id='translationresult'>Loading...</span>")
    $("#translateguessinput").prop("disabled", true)
    $('#translateguessdiv').addClass("translateguessextendcls")
    $("#translateguessbutton").html("Add to Pack")
    $('#translateguessbutton').addClass("translateguessaddbtn")
    $("#translateguessbutton").off("click")
    $("#translateguessbutton").on("click", addToPack)
}

function addToPack() {
    chrome.storage.local.get(['input'], function (result) {
        original = htmlSafe(result.input)
        guess = htmlSafe($("#translateguessinput").val())
        translation = $("#translationresult").html()
        
        chrome.storage.sync.get(['cards'], function (result) {
            cards = result.cards
            cards[makeid(5)] = {original: original, guess: guess, translation: translation}
            chrome.storage.sync.set({cards: cards}, function(){})
            document.body.removeChild(document.getElementById("translateguessdiv"))
        })
    })
}

$('body *:not(#translateguessbox)').on('click', function () {

    chrome.storage.sync.get(['domains'], function(result) {
        domains = result.domains
        domain = new URL(window.location.href)
        domain = domain.hostname
        if (domains.includes(domain)) {
            try {
                document.body.removeChild(document.getElementById("translateguessdiv"))
            } catch (err) {}
            selection = document.getSelection().toString()
            if (selection != "" && selection.split(" ").length <= 3 && selection.split(" ").length > 0) {
                chrome.storage.local.set({input: selection}, function(){});
                range = window.getSelection().getRangeAt(0).cloneRange()
                range.collapse(false)
                span = document.createElement("span")
                span.appendChild(document.createTextNode("\ufeff"))
                range.insertNode(span)
        
        
                selectionEl = document.createElement("div");
                selectionEl.innerHTML = '<input id="translateguessinput" class="translateguess translateguessextendcls" placeholder="What does this mean?"></input><p id="translateguessresult"></p><button id="translateguessbutton" class="translateguess">Guess</button>';
                selectionEl.style.position = "absolute";
                selectionEl.id = "translateguessdiv"
                selectionEl.classList.add("translateguess")
                document.body.appendChild(selectionEl);
        
                var obj = span;
                var left = 0, top = 0;
                do {
                    left += obj.offsetLeft + 5;
                    top += obj.offsetTop;
                } while (obj = obj.offsetParent);
        
                    selectionEl.style.left = left + "px";
                    selectionEl.style.top = top + "px";
        
                    span.parentNode.removeChild(span);
                    $("#translateguessresult").hide()
                    $("#translateguessbutton").on("click", clickButton)
            }
        }
    })

});