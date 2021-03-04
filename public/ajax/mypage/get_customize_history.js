$(function () {
    $.ajax({
        url: "/mypage-api/get_customize_history",
        type: "post",
        dataType: "json",
        data: {
            user_id: $("#user_id").val()
        }
    }).then(
        result => {
            const s3_url = "https://s3-ap-northeast-1.amazonaws.com/crea-test-bucket/public/"
            if (!result.length) {
                $("#not-found").html(`
  <section class="p-md-3 mx-md-5 text-center text-lg-left">
    <div class="container my-5 py-5 z-depth-1">
        <h3 class="font-weight-bold black-text mb-4 pb-2 text-center">カスタマイズ履歴</h3>

   <section class="text-center px-md-5 mx-md-5 mb-0 dark-grey-text">
            <p class="text-center mx-auto">履歴はありません。</p>
            <a href="/"><button type="button" class="btn btn-blue-grey btn-rounded mt-3 waves-effect waves-light">戻る</button></a>
    </section>
 </div>
  </section>
`)
                return
            }
            result.forEach(items => {
                const html = `<div class="col-lg-4 mb-4">
                <div class="card positionr">
                    <div class="avatar white d-flex justify-content-center align-items-center">
                        <img src="${s3_url}${items.front_image_path}" class="img-fluid w-75 mt-4 mx-auto"/>
                    </div>
                    <div class="card-body my-4 positiona mx-auto">
                        <a href="/customize/remake/${items.id}" class="btn btn-blue-grey">再編集</a>
                    </div>

                </div>
            </div>`
                $("#result").append(html)
            })
        },
        error => {
            console.log("error", error)
        }
    )
})