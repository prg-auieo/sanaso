const dpath = `./audios/`
const audiolist = {}
const ctx = new AudioContext()
let isalt = false


function playaudio(audio,name) {
    if (!audiolist[audio].isgot) {
        alert(`【${name}】はまだ準備中です`)
        return
    }

    const source = ctx.createBufferSource();
    source.buffer = audiolist[audio].data;
    source.connect(ctx.destination);
    source.start(); // ← 再生

}

document.addEventListener("DOMContentLoaded",()=>{
    const audios = document.getElementById("buttons").querySelectorAll("button")

    audios.forEach((v)=>{
        const {audio,name,key} =  v.dataset
        v.textContent = name

        const json = {"filename":audio,"name":name,"isgot":false,"data":null,"key":key}
        audiolist[audio] = json
        
        
        v.addEventListener("click",(ev)=>{
            const ele = ev.target
            const {audio,name} =  ele.dataset
            playaudio(audio,name)
        })
    })
    const list = Object.values(audiolist)
    let i = 0
    list.forEach(async(v)=>{
        const url = `${dpath}${v.filename}`
        fetch(url).then((res)=>{
            res.arrayBuffer().then((buf)=>{
                ctx.decodeAudioData(buf).then((audioBuffer)=>{
                    audiolist[v.filename].data = audioBuffer
                    audiolist[v.filename].isgot = true
                    console.log(`Loaded:%c${v.filename}(${v.name})`,"color:red;")
                    i++
                    document.getElementById("statusbar").innerText = `${document.getElementById("statusbar").innerText}\n[${v.filename}] 読み込み完了`      
                })
            })
        })
    })

    document.addEventListener("keyup",(ev)=>{
        const key = String(ev.key)
        if (key == "Alt") isalt = false
    })
    document.addEventListener("keydown",(ev)=>{
        const key = String(ev.key)
        if ( key == "Alt") {
            isalt = true
            return
        }
        if (!isalt) return
        Object.values(audiolist).filter((v)=>{return v.key == key}).forEach((v)=>{
            playaudio(v.filename,v.name)
            document.querySelectorAll(`button[data-key="${key}"]`).forEach((e)=>{

                e.classList.add("jsclick")
                setTimeout(()=>{e.classList.remove("jsclick")},1000*0.1)
            })
        })
    })
})
