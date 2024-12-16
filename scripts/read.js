let id;
try {
    if (Number(parseSearchArgs().id)) {
        document.querySelector(".form-leader :nth-child(1) .question-content input").value = parseSearchArgs().id;
        check();
    }
} catch (error) {null};
let canvas = document.getElementById("result");
let ctx = canvas.getContext("2d");
let positions = [[108, 94, 24, 1, 200, 408], [8, 146, 24, 2], [8, 217, 24, 3], [8, 313, 24, 4], [8, 450, 24, 5], [8, 600, 24, 5], [8, 749, 24, 3], [8, 864, 24, 4], [8, 991, 24, 3], [60, 1080, 18, 1, 240], [8, 1124, 24, 3], [8, 1230, 24, 4]];
let color = "#000000";
let img = new Image();
img.src = "/assets/demo.jpg";
img.onload = () => ctx.drawImage(img, 0, 0, 616, 1334);
async function check() {
    id = document.querySelector(".form-leader :nth-child(1) .question-content input").value;
    await fetch(`/handle?method=read&id=${id}`).then(res => {
        if (res.status != 200 || !res.ok) {
            switch (res.status) {
                case 429:
                    createToast("error", `错误码：${res.status}<br>您的请求过于频繁`, true, 2);
                    break;
                case 404:
                    createToast("error", `错误码：${res.status}<br>指定ID的问卷不存在`, true, 2);
                    break;
                case 403:
                    createToast("error", `错误码：406<br>这张问卷还未被亲友填写哦`, true, 2);
                    break;
                case 500:
                    createToast("error", `错误码：${res.status}<br>您的请求方法有误`, true, 2);
                    break;
                default:
                    createToast("error", `错误码：${res.status}<br>未知错误`, true, 2);
                    break;
            }
            throw "Error!";
        }
        return res.json();
    }).then(data => {
        if (!data.data.data[1]) {
            createToast("error", `错误码：406<br>这张问卷还未被亲友填写哦`, true, 2);
            return;
        }
        drawResult(data.data.data[0], 0, data.data.data[0][data.data.data[0].length - 1])
        drawResult(data.data.data[1], 1, data.data.data[1][data.data.data[1].length - 1]);
        document.querySelector("span#ttl").innerHTML = `此链接剩余有效期：${getDuration(Number(data.data.ttl))}<br>如有需要，请尽快保存图片，谢谢。`;
        document.querySelector(".form-title").style.display = "none";
        document.querySelector(".form-leader").style.display = "none";
        document.querySelector(".form-result").style.display = "block";
    });
}
function drawResult(result, cnid, color) {
    result.forEach((value, index) => {
        if (index == result.length - 1) {
            return;
        }
        let fontSize = positions[index][2];
        let maxWidth = positions[index][4] ? positions[index][4] : 300;
        ctx.font = String(fontSize) + "px Heiti";
        ctx.fillStyle = color;
        let texts = checkTextLength(maxWidth, fontSize, value);
        for (let i = 0; i <= texts.rows && i <= positions[index][3].toFixed(0); i++) {
            ctx.fillText(value.slice(texts.rowFontNum*(i-1), texts.rowFontNum*i), (!cnid ? positions[index][0] : (positions[index][5] ? positions[index][5] : 318)), positions[index][1]+(i-0.2)*fontSize, maxWidth);
        }
    });
}
function checkTextLength(maxWidth, fontSize, string) {
    let rowFontNum = Math.floor(maxWidth / fontSize);
    let strLength = string.length;
    let rows = Math.ceil(strLength / rowFontNum);
    return{maxWidth, fontSize, rowFontNum, strLength, rows};
}
function parseSearchArgs() {
    let url = location.search;
    let rst = {};
    if (url.indexOf("?") != -1) {
        let str = url.substring(1);
        let parts = str.split("&");
        for(let i=0; i<parts.length; i++) rst[parts[i].split("=")[0]] = decodeURI(parts[i].split("=")[1]);
    }
    return rst;
}
function getDuration(second) {
   let duration;
   let days = Math.floor(second / 86400);
   let hours = Math.floor((second % 86400) / 3600);
   let minutes = Math.floor(((second % 86400) % 3600) / 60);
   let seconds = Math.floor(((second % 86400) % 3600) % 60);
   if (days > 0)  duration = days + "天" + hours + "小时" + minutes + "分" + seconds + "秒";
   else if (hours > 0)  duration = hours + "小时" + minutes + "分" + seconds + "秒";
   else if (minutes > 0) duration = minutes + "分" + seconds + "秒";
   else if (seconds > 0) duration = seconds + "秒";
   return duration;
}
function saveCanvas() {
    download(canvas.toDataURL());
}
