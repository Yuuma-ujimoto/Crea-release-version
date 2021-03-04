$(() => {
    $("#good-button").click(() => {
        $.ajax({
            url: "/sns-api/good",
            type: "post",
            dataType: "json",
            data: {
                post_id: $("#post_id").val()
            }
        }).then(
            (result) => {
                if (!result.error) {
                    if (result.status) {
                        $("#good-button").removeClass("far").addClass("fas")
                    } else {
                        $("#good-button").removeClass("fas").addClass("far")
                    }
                }
            },
            (error) => {
                location.href("/")
            })
    })
})