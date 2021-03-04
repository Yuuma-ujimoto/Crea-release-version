get_comment = () => {
    $.ajax({
        url: "/sns-api/get_comment",
        type: "post",
        dataType: "json",
        data: {
            post_id: $("#post_id").val()
        }
    }).then(
        result => {
            console.log("get-comment>success", result)
            $("#comment-result").empty()
            let html;

            result.result.forEach(item => {
                // html = "<div class='comment-box'>"+
                //     "<p>投稿者:"+item.user_name+"</p>"+
                //     "<p>"+item.reply_content+"</p>"+
                //     "</div>"

                html = `
                     <div class="my-4">
                        <h4 class="mb-1 h5">${item.user_name}</h4>
                        <p class="h6">${item.reply_content}</p>
                        <p class="h6">投稿日:${item.created_at.slice(0,10)}/${item.created_at.slice(11,19)}</p>
                     </div>
                        `
                $("#comment-result").prepend(html)
            })
        },
        error => {
            console.log("get-comment>error", error)
        }
    )
}

$(() => {
    get_comment();

    $("#button-addon2").click(() => {
        console.log("test")
        $.ajax({
            url: "/sns-api/post_comment",
            type: "post",
            dataType: "json",
            data: {
                post_id: $("#post_id").val(),
                reply_content: $("#comment-input").val()
            }
        }).then(
            result => {
                console.log("post-comment>success", result)
                $("#comment-input").val("");
                get_comment()
            },
            error => {
                console.log("post-comment>error")
                $("#comment-input").val("");
            }
        )
    })
})
