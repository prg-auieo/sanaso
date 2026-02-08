// 三送会のためだけに作るものじゃないよなこれ....()()
const dpath = `./audios/`
const audiolist = {}
const ctx = new AudioContext()
let ispush = false

const sourcelist = []

function stopaudio() {
    sourcelist.forEach((v)=>{
        v.source.stop()
        
    })
    document.getElementById("statusbar").innerText = `[All Audio Stoped]\n${document.getElementById("statusbar").innerText}`      

}

function playaudio(audio,name) {
    if (!audiolist[audio].isgot) {
        alert(`【${name}】はまだ準備中です`)
        return
    }

    const source = ctx.createBufferSource();
    source.buffer = audiolist[audio].data;
    source.connect(ctx.destination);
    source.start(); // ← 再生
    document.getElementById("statusbar").innerText = `Playing... [${audio}]\n${document.getElementById("statusbar").innerText}`
    const uuid = crypto.randomUUID()
    const entry = { source,uuid };
    sourcelist.push(entry);
    source.addEventListener("ended",()=>{
        const idx = sourcelist.indexOf(entry);
        if (idx !== -1) sourcelist.splice(idx, 1);
    })

}

document.addEventListener("DOMContentLoaded",()=>{
    const audios = document.getElementById("buttons").querySelectorAll("button")

    audios.forEach((v)=>{
        const {audio,name,key,type} =  v.dataset
        if (type !== "stop") {
            v.textContent = name
            const json = {"filename":audio,"name":name,"isgot":false,"data":null,"key":key}
            audiolist[audio] = json
        }
        
        if (key) {
            const keyele = document.createElement("span")
            keyele.textContent+= `\n${key}`
            keyele.classList.add("key")
            v.appendChild(keyele)
        }
        
        v.addEventListener("click",(ev)=>{
            const ele = ev.target
            const {audio,name,type} =  ele.dataset
            if (type == "stop") {
                stopaudio()
            } else {
                playaudio(audio,name)
            }
        })
    })
    const list = Object.values(audiolist)
    let i = 0
    list.forEach((v,i,a)=>{
        const url = `${dpath}${v.filename}`
        i++
        fetch(url).then((res)=>{
            res.arrayBuffer().then((buf)=>{
                ctx.decodeAudioData(buf).then((audioBuffer)=>{
                    audiolist[v.filename].data = audioBuffer
                    audiolist[v.filename].isgot = true
                    console.log(`Loaded:%c${v.filename}(${v.name})`,"color:red;")
                    document.getElementById("statusbar").innerText = `[${v.filename}] Loaded...\n${document.getElementById("statusbar").innerText}`
                    i--
                    if (i == 0) document.getElementById("statusbar").innerText = `===Load Completed===\n${document.getElementById("statusbar").innerText}`      
                })
            })
        })
    })
     

    document.addEventListener("keyup",(ev)=>{
        const key = String(ev.key)
        if (key == "a") ispush = false
    })
    document.addEventListener("keydown",(ev)=>{
        const key = String(ev.key)
        if ( key == "a") {
            ispush = true
            return
        }
        if (!ispush) return
        if (key == document.querySelector(`button[data-type="stop"]`).dataset.key) {
            stopaudio()
            return
        }
        Object.values(audiolist).filter((v)=>{return v.key == key}).forEach((v)=>{
            playaudio(v.filename,v.name)
            document.querySelectorAll(`button[data-key="${key}"]`).forEach((e)=>{
                e.classList.add("jsclick")
                setTimeout(()=>{e.classList.remove("jsclick")},1000*0.1)
            })
        })
    })


    document.getElementById("clearlog").addEventListener("click",()=>{
        document.getElementById("statusbar").textContent = ""
        console.log("Cleared Log")
    })
})