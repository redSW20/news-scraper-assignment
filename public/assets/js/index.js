// Default message when there are no articles loaded
function emptyArticles(){
    if($(".container").text().trim() === ""){
        $(".container").append("<div class='alert alert-info'>"+
        "<strong>Message: </strong> Click the 'Scrape News' button to scrape articles!"+
      "</div>");
    }
}

emptyArticles();

// Ajax request to pull articles from new york times
function scrapeNews() {
    $(".container").empty();
    $(".container").append("<div class='alert alert-success'>"+
        "<strong>Message: </strong> Scrape in progress!"+
      "</div>");
    return $.ajax({
        headers: {
            "Content-Type": "application/json"
        },
        type: "GET",
        url: "api/scraper"
    }).then(function (res) {
        $(".container").empty();
        console.log(res);
        $(".container").append("<div class='list-group'>");
        for(var i = 3; i<res.length; i++){
            $(".container").append(
                "<hr><br><div><a hrefclass='list-group-item list-group-item-action flex-column align-items-start'>" + 
                //"<div class='d-flex w-100 justify-content-between'>" + 
                "<h5 class='mb-1'>" + res[i].title + "</h5>" +
                //"</div>" +
                "<small><a href='" + res[i].link + "'>Link to article</a></small><br>" +
                "<small><button class='btn btn-outline-info my-2 my-sm-0' onclick='saveArticle(this)'>Save Article</button></small>" +
                "<p class='mb-1'>" + res[i].description + "</p></a></div>"   
          )
        }
    });
}

// Send ajax request to store article in database
function saveArticle(obj){
    articleObj = {
        title: $(obj).parent().parent().find("h5").text(),
        description: $(obj).parent().parent().find("p").text(),
        link: $(obj).parent().parent().find("small").find("a").attr("href")
    }

    $.ajax({
        method: "POST",
        url: "/saveArticle",
        data: articleObj
    }).then(function(data){
        if(data==="Article Saved!"){
            $(obj).text("Saved").attr("disabled","true");
        }
        else{
            $(obj).text("Already Saved").attr("disabled","true");
        }
    })
}