var braggingWords = [
	"humbled",
	"proud",
	"accomplished",
	"excited",
	"announce"
]


var detectBragging = function (text) {
	var textLower = text.toLowerCase();
	for (let i = 0; i < braggingWords.length; i++) {
		var braggingWord = braggingWords[i];
		if (textLower.includes(braggingWord)) {
			return true;
		}
	}
}

var labelledPosts = new Set();


var labelPosts = function() {
	var posts = $(".feed-shared-update-v2__description-wrapper");

	for (let i = 0; i < posts.length; i++) {
		var post = posts[i];

		if (!labelledPosts.has(i)) {
			var texts = post.getElementsByClassName("break-words");

			// fix this later, this just gets the first text
			if (texts.length > 0) {
				var text = texts[0].innerText;
				
				if (detectBragging(text)) {
					console.log("this is bragging");
					$.get(chrome.runtime.getURL('/braggingElement.html'), function(data) {
					    $($.parseHTML(data)).prependTo(post);
					});

					labelledPosts.add(i);


				}
			}
		}
		

	}
}




window.onload = function() {
	var intervalID = window.setInterval(labelPosts, 500);

}


