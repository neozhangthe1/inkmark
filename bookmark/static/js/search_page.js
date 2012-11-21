function bind_func() {
	$('#link_nav').click(function(){
		$("#link_tab").show();
		$("#user_tab").hide();
		$('#link_li').addClass("active");
		$("#user_li").removeClass("active");
	});
	$('#user_nav').click(function(){
		$("#link_tab").hide();
		$("#user_tab").show();
		$('#link_li').removeClass("active");
		$("#user_li").addClass("active");
	});
	$('.results_wrap .page_nav a').click(function () {
		var href=$(this).attr('href');
		var index=$(this).closest('.results_wrap').index();
		$.get(href,null,function (result) {
			$('.results_wrap').eq(index).html($('.results_wrap',result).eq(index).html());
		});
		return false;
	});
}
function ajax_search() {
	var query=$(this).find('#id_query').val();
	if (query.search(/\S+/)<0) {
		$("#search_title").text("feeling lucky");
	}
	else {
		$("#search_title").text("result");
	}
	$.get("/search/?query="+encodeURIComponent(query),null,function (result) {
		$('#search_results').html($('#search_results',result).html());
		bind_func();
	});
	return false;
}
$(function () {
	$("#search_torso").submit(ajax_search);
	bind_func();
});
