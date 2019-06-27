function emptyArticles(){
    if($(".list-group").text().trim() === ""){
        $(".list-group").append("<div class='alert alert-info'>"+
        "<strong>Message: </strong> You have no saved arcticles, go to the homepage to save some!"+
      "</div>");
    }
}

emptyArticles();

function deleteArticle(obj){
    $.ajax({
        method: "DELETE",
        url: "/deleteArticle",
        data: {id: $(obj).attr("data-id")}
    }).then(function(data){
        //console.log(data);
        location.reload();
    })
}

function comment(obj){
    $.ajax({
        method: "GET",
        url: "/getComment/"+$(obj).attr("data-id")
    }).then(function(data){
        //console.log(data.note);
        $(".modal-body").empty();
        $("#textArea").val('');
        if(!data.note){
            $(".modal-body").text("No Comments");
        }
        else {
            $(".modal-body").text(data.note.body);
            $(".modal-body").append("<br><button data-id='"+ data.note._id +"' class='btn btn-danger' onclick='deleteComment(this)'>Delete Comment</button>")
        }
        $("#inputArea").attr("data-id",$(obj).attr("data-id"));
    })
}

function addComment(obj){
    //console.log($(obj).parent().attr("data-id"));
    if($(obj).parent().find("textarea").val().trim()){
        $.ajax({
            method: "POST",
            url: "/addComment/"+$(obj).parent().attr("data-id"),
            data: {body: $(obj).parent().find("textarea").val().trim()}
        }).then(function(data){
            //console.log(data);
            location.reload();
        })
    }
    else{
        console.log("Add a comment");
    }
}

function deleteComment(obj){
    //console.log($(obj).attr("data-id"));
    $.ajax({
        method: "DELETE",
        url: "/deleteNote",
        data: {id: $(obj).attr("data-id")}
    }).then(function(data){
        //console.log(data);
        location.reload();
    })
}