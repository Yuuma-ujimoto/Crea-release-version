$(() => {
    const post_id = $("#post_id").val()
    if (!post_id) {
        location.href = "/error/ClientError"
    }
    $.ajax({
        url: "/sns-api/get_status",
        type: "post",
        dataType: "json",
        data: {
            post_id: post_id
        }
    }).then(
        result => {
            const post = result.result

            const s3_path = 'https://s3-ap-northeast-1.amazonaws.com/crea-test-bucket/public/'
            $("#bigimg").attr("src", s3_path + post.front_image_path)
            $("#img1").attr("src", s3_path + post.front_image_path)
            $("#img2").attr("src", s3_path + post.back_image_path)

            $("#post_title").append(post.post_title)
            $("#post_user_name").append(post.user_name).attr("href", `/view/user-page/${post.user_id}`)
            $("#post_content").append(post.post_content)
            $("#remake").attr("href", `/customize/remake/${post.customize_id}`)
            $("#customize_id").attr("value", post.customize_id)
            if (result.good_flag) {
                $("#good-button").removeClass("far").addClass("fas")
            } else {
                $("#good-button").removeClass("fas").addClass("far")
            }
        }
    )

})
