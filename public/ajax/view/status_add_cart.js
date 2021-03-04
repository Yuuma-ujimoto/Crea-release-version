$(document).ready(
    () => {
    $("#add-cart").click(() => {
            console.log("a")
            const customize_id = $("#customize_id").val();
            $.ajax({
                url: "/utility-api/add_cart/",
                type: "post",
                dataType: "json",
                data: {
                    customize_id: customize_id
                }
            }).then(
                result => {
                    console.log("a")
                    if (result.error) {
                        alert(result.error_message)
                    }
                    else{
                        console.log(result)
                        location.href = "/customize/add_cart"
                    }
                },
                error => {

                }
            )
        }
    )
})