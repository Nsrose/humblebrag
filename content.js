var API_URL = 'https://humblebrag-1b57a-default-rtdb.firebaseio.com/LabelledData.json';

var braggingWords = [
	"humbled",
	"proud",
	"accomplished",
	"excited",
	"announce",
	"honored",
	"fortunate",
	"thrilled",
	"new role",
	"✅",
];

var sellingWords = [
	"comment below",
	"share this post",
	"sign up",
	"link below",
	"subscribe to",
];




var detectBragging = function (text, callback) {
	var textLower = text.toLowerCase();
	var url = "https://review-sentiment-analyzer-001.herokuapp.com/humblebrag/";
	var data = JSON.stringify({
		"text" : text
	});
	$.ajax({
		type: "POST",
		url: url,
		data: data,
		contentType: "application/json; charset=utf-8",
		dataType:"json",
		success: function(response) {
			callback(response);
		},
		error: function(jqXHR, textStatus, errorThrown){ 
			console.log(errorThrown);
		}
	})
}

var detectSelling = function (text) {
	var textLower = text.toLowerCase();
	for (let i = 0; i < sellingWords.length; i++) {
		var sellingWord = sellingWords[i];
		if (textLower.includes(sellingWord)) {
			return true;
		}
	}
}




function getRandomToken() {
    var randomPool = new Uint8Array(32);
    crypto.getRandomValues(randomPool);
    var hex = '';
    for (var i = 0; i < randomPool.length; ++i) {
        hex += randomPool[i].toString(16);
    }
    return hex;
}


function sendLabelledData(clientID, text, feedbackType, feedbackLabel, extensionLabel) {
	var data = JSON.stringify({
		"clientID": clientID,
		"label" : parseInt(feedbackLabel),
		"text" : text,
		"feedbackType": feedbackType,
		"extensionLabel" : extensionLabel
	})

	$.ajax({
		type: "POST",
		url: API_URL,
		data: data,
		contentType: "application/json",
		success: function(data, status) {
			console.log(status);
		}
	})

}




var getClientAndSendData = function(text, feedbackType, feedbackLabel, extensionLabel) {
	
	//TODO fix this part to get a real ClientID that persists in local storage and replace this line:
	sendLabelledData(getRandomToken(), text, feedbackType, feedbackLabel, extensionLabel);


	// chrome.storage.sync.get('userid', function(items) {
 //    var userid = items.userid;
	//     if (userid) {
	//         sendLabelledData(userid);
	//     } else {
	//         userid = getRandomToken();
	//         chrome.storage.sync.set({userid: userid}, function() {
	//             sendLabelledData(userid);
	//         });
	//     };
	//     sendLabelledData(userid, selectedValue, text);
	// });
}


function showOrHideImageVideo(post, show) {
	var postContainer = post.closest(".occludable-update");
	var imageOrVideo = $(postContainer).find(".feed-shared-update-v2__content");
	if (imageOrVideo.length > 0) {
		if (show) {
			imageOrVideo.css("filter", "blur(0px)");	
		} else {
			imageOrVideo.css("filter", "blur(8px)");
		}
		
	}
}

function revealHideButtons(post) {
	var body = $(post).find(".break-words");
	body.css("filter", "blur(4px)");

	// also hide any attached videos or images
	showOrHideImageVideo(post, false);

	$(post).find(".reveal-button").removeClass("hidden");
	$(post).find(".reveal-button").unbind().click(function(data) {
		var post= data.currentTarget.closest(".feed-shared-update-v2__description-wrapper")
		$(post).find(".break-words").css("filter", "blur(0)");
		showOrHideImageVideo(post, true);
		$(this).addClass("hidden");
		$(post).find(".hide-button").removeClass("hidden");
	})
	$(post).find('.hide-button').unbind().click(function(data) {
		var post= data.currentTarget.closest(".feed-shared-update-v2__description-wrapper")
		$(post).find(".break-words").css("filter", "blur(4px)")
		showOrHideImageVideo(post, false);
		$(this).addClass("hidden");
		$(post).find(".reveal-button").removeClass("hidden");
	})

}




var labelPosts = function() {
	var posts = $(".feed-shared-update-v2__description-wrapper");

	$.get(chrome.runtime.getURL('/reality_check.html'), function (data) {
		for (let i = 0; i < posts.length; i++) {
			var post = posts[i];

			// first check if we already put a label on this post 
			if ($(post).find(".reality-check-container").length == 0) {
				var newDiv = document.createElement("div");
				newDiv.setAttribute("id", "reality-check-container-" + i);
				post.prepend(newDiv);
				var div = $("#reality-check-container-" + i);	

				div.html($.parseHTML(data));
				// add some IDs to this specific div
				$(div).find(".bragging-container").attr("id", "bragging-container-" + i);
				$(div).find(".selling-container").attr("id", "selling-container-" + i);

	
		

				// add functions
				$(".feedback-element").unbind().click(function(data) {
					// debugger;
					var post = data.currentTarget.closest(".feed-shared-update-v2__description-wrapper");
					var texts = post.getElementsByClassName("break-words");
					var text = "";
					if (texts.length > 0) {
						text = texts[0].innerText;
					}
					
					// which type of feedback is this for -- Bragging, Selling, or another one?
					var parentRealityItem = data.currentTarget.closest(".reality-item");
					var feedbackType = null;

					if (parentRealityItem.classList.contains("bragging-container")) {
						feedbackType = "bragging";
						
					} else if (parentRealityItem.classList.contains("selling-container")) {
						feedbackType = "selling";
					}

					// What did the Extension label this as?
					var extensionLabel = null;
					if (!$(parentRealityItem).find(".reality-check-label-true")[0].classList.contains("hidden")) {
						extensionLabel = true;
					} else {
						extensionLabel = false;
					}



					// Tell if it was accurate or not
					var feedbackLabel = 0;
					if (data.currentTarget.classList.contains("feedback-inaccurate")) {
						feedbackLabel = -1;
					} else {
						feedbackLabel = 1;
					}

					getClientAndSendData(text, feedbackType, feedbackLabel, extensionLabel);

					var feedbackRow = data.currentTarget.closest(".feedback-row");
					$(feedbackRow).find(".feedback-element-thanks").removeClass("hidden");
					$(feedbackRow).find(".feedback-accurate").addClass("hidden");
					$(feedbackRow).find(".feedback-inaccurate").addClass("hidden");
				});




				// Show the predicted labels for each type
				var texts = post.getElementsByClassName("break-words");



				if (texts.length > 0) {
					var text = texts[0].innerText;

					detectBragging(text, function(response) {
						if (response.label == "Bragging") {
							$("#bragging-container-" + i).find(".bragging-label-true").removeClass("hidden");
							revealHideButtons(post);
						} else {
							$("#bragging-container-" + i).find(".bragging-label-false").removeClass("hidden");
						}
					})
					
					// if (detectBragging(text)) {
					// 	$("#bragging-container-" + i).find(".bragging-label-true").removeClass("hidden");
					// 	revealHideButtons(post);
						
					// } else {
					// 	$("#bragging-container-" + i).find(".bragging-label-false").removeClass("hidden");
					// }

					if (detectSelling(text)) {
						$("#selling-container-" + i).find(".selling-label-true").removeClass("hidden");
						revealHideButtons(post);
					} else {
						// Check if this is an ad
						var postContainer = post.closest(".occludable-update");
						var promoted = $(postContainer).find(".feed-shared-actor__sub-description")
						if (promoted.length > 0 && promoted[0].innerText == "Promoted") {
							$("#selling-container-" + i).find(".selling-label-true").removeClass("hidden");
							revealHideButtons(post);
						} else {
							$("#selling-container-" + i).find(".selling-label-false").removeClass("hidden");	
						}
						
					}

					
					

				}
			}

		}
	});

}




window.onload = function() {
	var intervalID = window.setInterval(labelPosts, 500);


}


