const $=id=>document.getElementById(id),video=$("video"),audio=new Audio(),canvas=$("canvas"),ctx=canvas.getContext("2d",{willReadFrequently:true}),out=$("output"),chars="@%#*+=-:. ";let vu=null,au=null,raf=0,last=0,frame=0;audio.loop=false;
$("videoFile").onchange=e=>{let f=e.target.files[0];if(!f)return;if(vu)URL.revokeObjectURL(vu);vu=URL.createObjectURL(f);video.src=vu;video.load();$("videoName").textContent=f.name;$("status").textContent="LOADING VIDEO"};
$("audioFile").onchange=e=>{let f=e.target.files[0];if(!f)return;if(au)URL.revokeObjectURL(au);au=URL.createObjectURL(f);audio.src=au;$("audioName").textContent=f.name};
video.onloadeddata=()=>{$("status").textContent="VIDEO READY";$("play").disabled=$("pause").disabled=$("stop").disabled=false;draw()};
function draw(){if(!video.videoWidth||!video.videoHeight)return;let w=+$("width").value,h=Math.max(1,Math.round(w*video.videoHeight/video.videoWidth*.48));canvas.width=w;canvas.height=h;ctx.drawImage(video,0,0,w,h);let px=ctx.getImageData(0,0,w,h).data,s="";for(let y=0;y<h;y++){for(let x=0;x<w;x++){let i=(y*w+x)*4,b=(px[i]*.299+px[i+1]*.587+px[i+2]*.114)/255;s+=chars[Math.min(chars.length-1,Math.floor(b*chars.length))]}s+="\n"}out.textContent=s;$("frameCount").textContent=String(++frame).padStart(4,"0")}
function tick(t){if(video.paused||video.ended)return;if(t-last>=1000/+$("fps").value){draw();last=t}raf=requestAnimationFrame(tick)}
$("play").onclick=async()=>{if(!video.src)return;if(video.ended)video.currentTime=0;if(audio.src&&(audio.ended||audio.currentTime===0))audio.currentTime=0;try{await video.play();if(audio.src)await audio.play();$("status").textContent="PLAYING";cancelAnimationFrame(raf);raf=requestAnimationFrame(tick)}catch(e){$("status").textContent="PLAY ERROR"}};
$("pause").onclick=()=>{video.pause();audio.pause();cancelAnimationFrame(raf);$("status").textContent="PAUSED";draw()};
$("stop").onclick=()=>{video.pause();audio.pause();video.currentTime=0;audio.currentTime=0;cancelAnimationFrame(raf);$("status").textContent="STOPPED";draw()};
video.onended=()=>{audio.pause();cancelAnimationFrame(raf);$("status").textContent="FINISHED";draw()};
video.onseeked=draw;
$("width").oninput=()=>{$("widthValue").textContent=$("width").value;if(video.readyState>=2)draw()};
$("fps").oninput=()=>$("fpsValue").textContent=$("fps").value+" FPS";