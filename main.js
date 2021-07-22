function deleteCard() {
    id = $(this).attr('id')
    document.getElementById('cards').removeChild(document.getElementById(`card-${id}`))
    chrome.storage.sync.get(['cards'], function(result) {
        cards = result.cards
        delete cards[id]
        chrome.storage.sync.set({cards: cards}, function() {
            if (!(Object.keys(cards).length > 0)) {
                $("#nothingadded").show()
            }
        })
    })
}

chrome.storage.sync.get(['domains'], function(result) {
    domains = result.domains

    chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
        let url = tabs[0].url;
        let domain = new URL(url)
        domain = domain.hostname
        if (domains.includes(domain)) {
            $("#sitetoggle").removeClass("btn-secondary")
            $("#sitetoggle").addClass("btn-success")
            $("#sitetoggle").html("On")
        }
    })
})

chrome.storage.sync.get(['cards'], function(result) {
    cards = result.cards

    if (Object.keys(cards).length > 0) {
        $("#nothingadded").hide()
    }

    for (let id in cards) {
        guess = cards[id].guess
        if (guess == "") {
            guess = "<i>None</i>"
        }
        $("#cards").append(`<div id="card-${id}" class="row"><div class="card"><div class="card-body"><h5 class="card-title">${cards[id].original}</h5><p class="card-text"><span class="guess"><b>Your guess:</b> ${guess}</span><br><b>Translation:</b> ${cards[id].translation}</p><button id="${id}" class="btn btn-danger deletebutton float-right">Delete</button></div></div></div>`)
    }

    $(".deletebutton").on("click", deleteCard)
})

$("#sitetoggle").on("click", function(){
    chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
        let url = tabs[0].url;
        let domain = new URL(url)
        domain = domain.hostname
        
        chrome.storage.sync.get(['domains'], function(result) {
            domains = result.domains
            if (domains.includes(domain)) {
                domains.splice(domains.indexOf(domain), 1)
                chrome.storage.sync.set({domains: domains}, function() {
                    $("#sitetoggle").removeClass("btn-success")
                    $("#sitetoggle").addClass("btn-secondary")
                    $("#sitetoggle").html("Off")
                })
            } else {
                domains.push(domain)
                chrome.storage.sync.set({domains: domains}, function() {
                    $("#sitetoggle").removeClass("btn-secondary")
                    $("#sitetoggle").addClass("btn-success")
                    $("#sitetoggle").html("On")
                })
            }
        })
    })
})