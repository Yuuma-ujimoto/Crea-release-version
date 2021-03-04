$(() => {
    $.ajax({
        url: "/sns-api/get_ranking",
        type: "post",
        dataType: "json"
    }).then(result => {
            //console.log(result)
            const s3 = "https://s3-ap-northeast-1.amazonaws.com/crea-test-bucket/public/"

            //一位の処理
            const api_result = result.result
            for(let i=0;i<api_result.length;i++){
                //console.log(api_result[i])
                $(`#rank${i+1}-img`).attr("src",s3+api_result[i].front_image_path)
                $(`#rank${i+1}-title`).html(api_result[i].post_title)
                $(`#rank${i+1}-link`).attr("href","/view/status/"+api_result[i].post_id)
            }
        },
        error => {
            console.log(error)
        })
})