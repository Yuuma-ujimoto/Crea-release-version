$(function () {
    console.log("a")
    $.ajax({
        url: "/sns-api/get_user_data",
        type: "post",
        dataType: "json",
        data: {
            user_id: $("#user_id").val(),
            page: 1
        }
    }).then(
        result => {
            //const s3_url = https://s3-ap-northeast-1.amazonaws.com/crea-test-bucket/public/
            if (result.error) {
                return
            }
            if(!result.posts.length){
                $("#not-found").html(`
                  <section class="p-md-3 mx-md-5 text-center text-lg-left">
    <div class="container my-5 py-5 z-depth-1">
        <h3 class="font-weight-bold black-text mb-4 pb-2 text-center">SNS</h3>

   <section class="text-center px-md-5 mx-md-5 mb-0 dark-grey-text">
            <p class="text-center mx-auto">投稿はありません。</p>
            <a href="/"><button type="button" class="btn btn-blue-grey btn-rounded mt-3 waves-effect waves-light">戻る</button></a>
    </section>
 </div>
  </section>
                `)
                return
            }
            $("#user-page-title").append(result.posts[0].user_name + "さんの投稿")
            result.posts.forEach(post => {
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
      <div class="col-lg-7 col-xl-6">
        <!-- Post title -->
        <h4 class="font-weight-bold mb-3"><strong>${post.post_title}</strong></h4>
        <!-- Excerpt -->
        <!-- Post data -->
        <p>by <span class="font-weight-bold">${post.user_name}</span>, 19/04/2018</p>
        <!-- Read more button -->
        <a href="/view/status/${post.id}" class="btn btn-blue-grey btn-md mx-0 btn-rounded">詳細を見る</a>
      </div>
      <!-- Grid column -->
    </div>
    <!-- Grid row -->
    <hr class="my-5">
  </section>
  <!--Section: Content-->`
                $("#result").append(html)
            })

        },
        error => {
            console.log(error)
        }
    )
})