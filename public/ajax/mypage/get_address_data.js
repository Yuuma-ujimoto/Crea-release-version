$(() => {
    $.ajax({
        url: "/mypage-api/get_address_data",
        type: "post",
        dataType: "json"
    }).then(
        result => {
            console.log(result)
            if (result.error) {
                alert(result.error_message)
                return
            }
            if (result.existsAddress) {
                result.result.forEach((items) => {
                    const html =`<section class="address-box">
                <h1>住所</h1>
                <p>${items.address}</p>
                <h2>受取人名義</h2>
                <p>${items.address_name}</p>
                <h3>電話番号</h3>
                <p>${items.phone_number}</p>
            </section>
            `;
                    $("#result").prepend(html)
                })
            }
        },
        error => {

        }
    )
})