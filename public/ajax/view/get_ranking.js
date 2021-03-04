$(function () {
    $.ajax({
        url: "/sns-api/get_ranking_sns",
        type: "post",
        dataType: "json",
        data: {
            limit: 10
        }
    }).then(
        result => {
            console.log(result)
            //const s3_url = https://s3-ap-northeast-1.amazonaws.com/crea-test-bucket/public/
            if (result.error) {
                console.log("error")
                return
            }
            console.log(result["posts"])
            console.log(typeof result.posts)
            let rank = 0
            result["posts"][0].forEach(post => {
                rank ++
                let html = ` 
 <section class="dark-grey-text">

    <!-- Grid row -->
    <div class="row align-items-center">

      <!-- Grid column -->
      <div class="col-lg-5 col-xl-6">

        <!-- Featured image -->
        <div class="view overlay rounded z-depth-1-half mb-lg-0 mb-4  col-xl-8 p-4 d-flex align-items-center">
          <img class="img-fluid" style="margin:0 auto" src="https://s3-ap-northeast-1.amazonaws.com/crea-test-bucket/public/${post.front_image_path}" alt="商品画像">
          <a>
            <div class="mask rgba-white-slight"></div>
          </a>
        </div>

      </div>
      <!-- Grid column -->

      <!-- Grid column -->
      <div class="col-lg-7 col-xl-6">

        <!-- Post title -->
        <h3 class="font-weight-bold mb-3">${rank}位</h3>
        <h4 class="font-weight-bold mb-3"><strong>${post.post_title}</strong></h4>
        <!-- Excerpt -->

        <!-- Post data -->
        <p>by <span class="font-weight-bold">${post.user_name}</span>  ${post.created_at.slice(0, 10)}</p>
        <p>いいね数 : ${post.good_count}</p>
        <!-- Read more button -->
        <a href="/view/status/${post.id}" class="btn btn-blue-grey btn-md mx-0 btn-rounded">詳細を見る</a>

      </div>
      <!-- Grid column -->

    </div>
    <!-- Grid row -->


    <hr class="my-5">

  </section>
  <!--Section: Content-->
`

                $("#result").append(html)
                console.log("a")
            })


        },
        error => {
            console.log("error", error)
        }
    )
})