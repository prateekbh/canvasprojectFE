<gp-draw>
	<canvas id="drawer">
	</canvas>
	<button class="save">
		<svg xmlns="http://www.w3.org/2000/svg" fill="#FFFFFF" height="24" viewBox="0 0 24 24" width="24">
		    <path d="M0 0h24v24H0z" fill="none"/>
		    <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
		</svg>
	</button>
	<script>
	var curr_img=null;
	this.on("mount",function(){
		document.querySelector('body').style.overflow="hidden";
		var el = document.getElementById('drawer');
		el.setAttribute("width",window.innerWidth);
		el.setAttribute("height",window.innerHeight);
		var ctx = el.getContext('2d');
		var isDrawing;

		el.addEventListener("touchstart", function(e) {
		  isDrawing = true;
		  ctx.lineWidth = 10;
		  ctx.lineJoin = ctx.lineCap = 'round';
		  ctx.shadowBlur = 10;
		  ctx.shadowColor = 'rgb(0, 0, 0)';
		  ctx.moveTo(e.touches[0].clientX, e.touches[0].clientY+58);
		});
		el.addEventListener("touchmove", function(e) {
		  if (isDrawing) {
		    ctx.lineTo(e.touches[0].clientX, e.touches[0].clientY+58);
		    ctx.stroke();
		  }
		});
		el.addEventListener("touchend", function(e) {
		  isDrawing = false;
		});

		document.querySelector(".save").addEventListener("click",function(e){
			fetch(window.ip+'/galleria/save',{
				headers: {
			      'Accept': 'application/json',
			      'Content-Type': 'application/json'
		    	},
			    method: "POST",
			    body: JSON.stringify({
			    	"image_id":curr_img,
			    	"title":"img_"+Date.now(),
			    	"image":el.toDataURL(),
			    })
			}).then(res=>res.json()).then(data=>{
				curr_img=data.image_id;
			});
		})
	});


	this.on("unmount",function(){
		document.querySelector('body').style.overflow="auto";
	})
	</script>
</gp-draw>
<gp-editimg>
	<canvas id="drawer">
	</canvas>
	<canvas id="bgcanvas">
	</canvas>
	<button class="save">
		<svg xmlns="http://www.w3.org/2000/svg" fill="#FFFFFF" height="24" viewBox="0 0 24 24" width="24">
		    <path d="M0 0h24v24H0z" fill="none"/>
		    <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
		</svg>
	</button>
	<button class="pr" onclick={raisepr}>
		<svg xmlns="http://www.w3.org/2000/svg" fill="#FFFFFF" height="24" viewBox="0 0 24 24" width="24">
		    <path d="M0 0h24v24H0z" fill="none"/>
		    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
		</svg>
	</button>
	<script>
	var curr_img=null;
	this.on("mount",function(){
		document.querySelector('body').style.overflow="hidden";
		var el = document.getElementById('drawer');
		var bgel = document.getElementById('bgcanvas');
		el.setAttribute("width",window.innerWidth);
		el.setAttribute("height",window.innerHeight);
		bgel.setAttribute("width",window.innerWidth);
		bgel.setAttribute("height",window.innerHeight);
		curr_img=veronica.getCurrentState().data[":imgid"];

		var ctx = el.getContext('2d');
		var bgctx = bgel.getContext('2d');

		var isDrawing;
		var imgToEdit = new Image();
        var bgImg = new Image();
        imgToEdit.setAttribute("crossOrigin","Anonymous");
        bgImg.setAttribute("crossOrigin","Anonymous");
        

        bgImg.onload = function(){
        	var rect=bgel.getBoundingClientRect();
        	bgctx.drawImage(bgImg, 0, 0, rect.width, rect.height);
        };

        imgToEdit.onload = function () {
            //draw background image
            var rect=el.getBoundingClientRect();
            ctx.drawImage(imgToEdit, 0, 0, rect.width, rect.height);
            startEditing(el,ctx);
        };

        imgToEdit.src = window.ip+"/image/"+veronica.getCurrentState().data[":imgid"]+"/data";
        bgImg.src = window.ip+"/image/"+veronica.getCurrentState().data[":sourceid"]+"/data";
	});

	function startEditing(el,ctx){
		el.addEventListener("touchstart", function(e) {
		  isDrawing = true;
		  ctx.lineWidth = 10;
		  ctx.lineJoin = ctx.lineCap = 'round';
		  ctx.shadowBlur = 10;
		  ctx.shadowColor = 'rgb(0, 0, 0)';
		  ctx.moveTo(e.touches[0].clientX, e.touches[0].clientY);
		});
		el.addEventListener("touchmove", function(e) {
		  if (isDrawing) {
		    ctx.lineTo(e.touches[0].clientX, e.touches[0].clientY);
		    ctx.stroke();
		  }
		});
		el.addEventListener("touchend", function(e) {
		  isDrawing = false;
		});

		document.querySelector(".save").addEventListener("click",function(e){
			fetch(window.ip+'/galleria/save',{
				headers: {
			      'Accept': 'application/json',
			      'Content-Type': 'application/json'
		    	},
			    method: "POST",
			    body: JSON.stringify({
			    	"image_id":curr_img,
			    	"title":"img_"+Date.now(),
			    	"image":el.toDataURL(),
			    })
			}).then(res=>res.json()).then(data=>{
				curr_img=data.image_id;
			});
		})
	}

	this.raisepr=function(e){
		e.preventDefault();
		fetch(window.ip+"/galleria/pullrequest/send?image_id="+veronica.getCurrentState().data[":imgid"],{
			headers: { 'x-account-id': window.uid },
			method: "POST",
		})
		.then(res=>{
			alert("PR RAISED");
			veronica.loc("/");
		});
	}

	this.on("unmount",function(){
		document.querySelector('body').style.overflow="auto";
	})
	</script>
</gp-editimg>
<gp-home>
	<gp-userpic each={item,i in data} data={item}></gp-userpic>
	<script>
		var self=this;
		this.data=[];
		this.on("mount",function(){
			fetch(window.ip+"/user/home",{
				headers: { 'x-account-id': window.uid }
			})
			.then(res=>res.json())
			.then(data=>{
				self.update({data: data[0]});
			})
		});
	</script>
</gp-home>
<gp-loader>
	<div class="loader">
	    <svg class="circular" viewBox="25 25 50 50">
	      <circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="2" stroke-miterlimit="10"/>
	    </svg>
	</div>
</gp-loader>
<gp-profile>
	<div class="loader { profileData ? 'hidden' : '' }">
		<gp-loader></gp-loader>
	</div>
	<div class="profile { !profileData ? 'hidden' : '' }">
		<div class="userinfo">
			<div class="pic">
				<img class="userpic" src="{profileData.user.avatar_url}"></img>
			</div>
			<div class="info">
				<div class="name">{profileData.user.name}</div>
				<div class="desc">front end engineer @ nowhere</div>
				<div class="container-followers"><a class="followers" href="/followers/prateek">{profileData.user.followers.length} followers</a></div>
			</div>
			<button if={profileData.user.account_id!==window.uid} class="btn-follow" onclick={follow}>
				{isFollowing||profileData.is_follower?'FOLLOWING':'FOLLOW'}
			</button>
		</div>
		<div class="tabs">
			<div class="tab own selected" onclick={selTab}>
				<div class="num">{profileData.owned_images&&profileData.owned_images.length}</div>
				<div class="label">OWN</div>
			</div>
			<div class="tab cloned" onclick={selTab}>
				<div class="num">{profileData.cloned_images&&profileData.cloned_images.length}</div>
				<div class="label">CLONED</div>
			</div>
			<div class="tab pr" if={profileData.user.account_id===window.uid} onclick={selTab}>
				<div class="num">{profileData.pull_requests&&profileData.pull_requests.length}</div>
				<div class="label">PRs</div>
			</div>
		</div>
		<div class="content">

			<div if={selectedTab===0}>
				<a class="imagelink" each={image in profileData.owned_images}>
					<img class="imgthumb" src="{window.ip+'/image/'+ image.image_id +'/data'}"></img>
				</a>	
			</div>
			<div if={selectedTab===1}>
				<a class="imagelink" href="/img/edit/{image.image_id}/{image.source_image_id}" each={image in profileData.cloned_images}>
					<img class="imgthumb" src="{window.ip+'/image/'+ image.image_id +'/data'}"></img>
				</a>	
			</div>
			<div if={selectedTab===2}>
				<a class="pr" each={pr in profileData.pull_requests} href="/pr/{pr.pull_request_id}">
					<img class="sender" src="{pr.sender.avatar_url}"></img>
					<span class="info"><b>{pr.sender.name}</b> sent a pr on</span>
					<img class="source" src={window.ip + "/image/"+pr.original_image.image_id+"/data" }></img>
				</a>
			</div>
		</div>
	</div>
	<script>
		var self=this;
		this.selectedTab=0;
		this.isFollowing=false;
		this.on("mount",function(e){
			fetch(window.ip+"/galleria/profile/details/"+veronica.getCurrentState().data[":user"],{
				headers: { 'x-account-id': window.uid }
			})
			.then(res=>res.json())
			.then(data=>{
				self.update({profileData: data});
			});

		})

		this.selTab=function(e){
			document.querySelector(".selected")&&document.querySelector(".selected").classList.remove("selected");
			e.target.classList.add("selected");
			if(e.target.classList.contains("cloned")){
				self.update({selectedTab: 1});	
			} else if(e.target.classList.contains("own")){
				self.update({selectedTab: 0});	
			} else {
				self.update({selectedTab: 2});	
			}
		}

		this.follow=function(e){
			e.preventDefault();
			fetch(window.ip+"/user/"+this.profileData.user.account_id+"/createFollower?follower_id="+window.uid)
			.then(res=>res.json())
			.then(data=>{
				self.update({isFollowing:true});
			});
		}
	</script>
</gp-profile>
<gp-pullrequest>
	<canvas id="drawer">
	</canvas>
	<canvas id="bgcanvas">
	</canvas>
	<button class="accept" onclick={acceptpr}>
		<svg xmlns="http://www.w3.org/2000/svg" fill="#FFFFFF" height="24" viewBox="0 0 24 24" width="24">
		    <path d="M0 0h24v24H0z" fill="none"/>
		    <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
		</svg>
	</button>
	<button class="pr" onclick={rejectpr}>
		<svg xmlns="http://www.w3.org/2000/svg" fill="#FFFFFF" height="24" viewBox="0 0 24 24" width="24">
		    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
		    <path d="M0 0h24v24H0z" fill="none"/>
		</svg>
	</button>
	<script>
	var curr_img=null;
	this.on("mount",function(){
		document.querySelector('body').style.overflow="hidden";
		var el = document.getElementById('drawer');
		var bgel = document.getElementById('bgcanvas');
		el.setAttribute("width",window.innerWidth);
		el.setAttribute("height",window.innerHeight);
		bgel.setAttribute("width",window.innerWidth);
		bgel.setAttribute("height",window.innerHeight);
		curr_img=veronica.getCurrentState().data[":imgid"];

		var ctx = el.getContext('2d');
		var bgctx = bgel.getContext('2d');

		var isDrawing;
		var imgToEdit = new Image();
        var bgImg = new Image();
        imgToEdit.setAttribute("crossOrigin","Anonymous");
        bgImg.setAttribute("crossOrigin","Anonymous");

        bgImg.onload = function(){
        	var rect=bgel.getBoundingClientRect();
        	bgctx.drawImage(bgImg, 0, 0, rect.width, rect.height);
        };

        imgToEdit.onload = function () {
            //draw background image
            var rect=el.getBoundingClientRect();
            ctx.drawImage(imgToEdit, 0, 0, rect.width, rect.height);
        };

        fetch(window.ip+"/galleria/pullrequest/"+veronica.getCurrentState().data[":prid"])
        .then(res=>res.json())
        .then(data=>{
        	imgToEdit.src = window.ip+"/image/"+data.image.image_id+"/data";
        	bgImg.src = window.ip+"/image/"+data.original_image.image_id+"/data";
        });
	});

	function startEditing(el,ctx){
		
	}

	this.rejectpr=function(e){
		e.preventDefault();
		/*fetch(window.ip+"/galleria/pullrequest/send?image_id="+veronica.getCurrentState().data[":imgid"],{
			headers: { 'x-account-id': window.uid },
			method: "POST",
		})
		.then(res=>{
			alert("PR RAISED");
			veronica.loc("/");
		});*/
		alert("reject nahi kr paoge");
	}

	this.acceptpr=function(e){
		e.preventDefault();
		var el = document.getElementById('drawer');
		var bgel = document.getElementById('bgcanvas');
		
		var ctx = el.getContext('2d');
		var bgctx = bgel.getContext('2d');
		var tempImg=new Image();

		tempImg.onload=function(){
			var rect=el.getBoundingClientRect();
			bgctx.drawImage(tempImg,0,0,rect.width, rect.height);
			el.remove();
			fetch(window.ip+"/galleria/pullrequest/approve/"+veronica.getCurrentState().data[":prid"],{
				headers: { 
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'x-account-id': window.uid 
				},
				method: "POST",
				body:JSON.stringify({
					image:bgel.toDataURL()
				})
			})
			.then(res=>{
				veronica.loc("/user/"+window.uid);
			});
		}

		tempImg.src=el.toDataURL();

		// fetch(window.ip+"/galleria/pullrequest/approve?image_id="+veronica.getCurrentState().data[":imgid"],{
		// 			headers: { 'x-account-id': window.uid },
		// 			method: "POST",
		// 		})
	}

	this.on("unmount",function(){
		document.querySelector('body').style.overflow="auto";
	})
	</script>
</gp-pullrequest>
<gp-search>
	<input type="text" class="q" placeholder="explore">
	<div class="loader { !resultShown ? '' : 'hidden' }">
		<gp-loader></gp-loader>
	</div>
	<div class="results { !resultShown ? 'hidden' : '' }">
		<div class="ppl">
			<div class="title">People</div>
			<div class="content" each={ user in searchdata.users }>
				<a href="/user/{user.account_id}" class="usernail">
					<div class="pic">
						<img class="pic" src="{user.avatar_url}"></img>
					</div>
					<div class="name">{ user.name }</div>
				</a>
			</div>
		</div>
		<div class="tags">
			<div class="title">Tags</div>
			<div class="content">
				<a class="tag" href="/tags/{tag}" each={ tag in searchdata.tags }>#{ tag }</a>
			</div>
		</div>
	</div>
	<script>
		var self=this;

		this.searchdata={};
		this.resultShown=false;

		this.on("mount",function(){
			document.querySelector(".q").addEventListener("keyup",function(e){
				document.querySelector(".results").classList.add("hidden");
				document.querySelector(".loader").classList.remove("hidden");
				self.update({ resultShown: false });
				fetch(window.ip+"/galleria/search/any/"+document.querySelector(".q").value)
				.then(res=>res.json()).then(data=>{
					self.update({ searchdata: data, resultShown: true });
					document.querySelector(".results").classList.remove("hidden");
					document.querySelector(".loader").classList.add("hidden");
				}).catch(()=>{
					self.update({ resultShown: false });
				});
			});
		})

	</script>
</gp-search>
<gp-tagpics>
	<div class="content"></div>
	<script>
		this.on("mount",function(){
			document.querySelector("h1").innerHTML="tag: "+veronica.getCurrentState().data[":tag"];
		});
		this.on("unmount",function(){
			document.querySelector("h1").innerHTML="Painteria";
		});
	</script>
</gp-tagpics>
<gp-userpic>
	<div class="userinfo">
		<div class="piccontainer">
			<img class="userpic" height="50" width="50" src="{this.opts.data.user_avatar_url}"></img>	
		</div>
		<a href="/user/{this.opts.data.account_id}" class="username">{this.opts.data.user_name}</a>
		<span class="time">15m</span>
	</div>
	<div class="painting" onclick={toggleCopy}>
		<img class="img-painting" src={window.ip+"/image/"+this.opts.data.image_id+"/data"}/>
		<button if={!this.opts.data.is_cloned} class="copy hidden" onclick={cloneImage}>
			<svg xmlns="http://www.w3.org/2000/svg" fill="#FFFFFF" height="24" viewBox="0 0 24 24" width="24">
			    <path d="M0 0h24v24H0z" fill="none"/>
			    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
			</svg>
		</button>
	</div>
	<script>
		var showingCopy=false;
		var $copy=this.root.querySelector(".copy");
		this.on("mount",function(e){
			$copy=this.root.querySelector(".copy");
		});
		this.toggleCopy=function(){
			if(!showingCopy){
				$copy&&$copy.classList.remove("hidden");
			}
			else{
				$copy&&$copy.classList.add("hidden");	
			}
			showingCopy=!showingCopy;
		}
		this.cloneImage=function(e){
			e.preventDefault();
			fetch(window.ip+"/galleria/clone?image_id="+this.opts.data.image_id,{
				headers: { 'x-account-id': window.uid },
				method: "POST"
			})
			.then(res=>res.json())
			.then(data=>{
				console.log(data);
				if(data.image_id){
					veronica.loc("/editpr/"+data.image_id);
				}
			});
		}
	</script>
</gp-userpic>
<gp-header>
	<header>
		<svg class="draw" xmlns="http://www.w3.org/2000/svg" fill="#FFFFFF" height="24" viewBox="0 0 24 24" width="24">
		    <path d="M0 0h24v24H0z" fill="none"/>
		    <path d="M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3zm13.71-9.37l-1.34-1.34c-.39-.39-1.02-.39-1.41 0L9 12.25 11.75 15l8.96-8.96c.39-.39.39-1.02 0-1.41z"/>
		</svg>
		
		<button class="menu" onclick={goToProfile}>
			<svg xmlns="http://www.w3.org/2000/svg" fill="#FFFFFF" height="24" viewBox="0 0 24 24" width="24">
			    <path d="M12 5.9c1.16 0 2.1.94 2.1 2.1s-.94 2.1-2.1 2.1S9.9 9.16 9.9 8s.94-2.1 2.1-2.1m0 9c2.97 0 6.1 1.46 6.1 2.1v1.1H5.9V17c0-.64 3.13-2.1 6.1-2.1M12 4C9.79 4 8 5.79 8 8s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 9c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z"/>
			    <path d="M0 0h24v24H0z" fill="none"/>
			</svg>
		</button>
		<h1>Painteria</h1>
	</header>
	<script>
	this.on("mount",function(){
		document.querySelector('.draw').addEventListener("click",function(){
			if(veronica.loc().name!=="draw")
				veronica.loc("/draw");
		});
	})
	this.goToProfile=function(e){
		e.preventDefault();
		veronica.loc("/user/"+window.uid);
	}
	</script>
</gp-header>