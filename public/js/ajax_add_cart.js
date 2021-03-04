$(function () {
    $(".add-cart-box").click(function () {
        console.log("func")
        const id = $(this).val();
        console.log(id)


        $.ajax({
            url: "/mypage/customize/api/add-cart",
            type: "post",
            dataType: "json",
            data: {
                id: id
            }
        }).then(
            result => {
                console.log("s", result)
                console.log(result.posts)
            },
            err => {
                console.log("e")
            }
        )
    })
})