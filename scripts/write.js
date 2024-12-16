let id;
let word;
try {
    if (Number(parseSearchArgs().id)) {
        document.querySelector(".form-leader :nth-child(1) .question-content input").value = parseSearchArgs().id;
        document.querySelector(".form-leader :nth-child(1) .question-content input").setAttribute("readonly", true);
        document.querySelector(".form-leader :nth-child(1) .question-content .form-ui-component-basic.size-small.multiple").style['background-color'] = "#eee";
    }
    if (parseSearchArgs().word.length == 4) {
        document.querySelector(".form-leader :nth-child(2) .question-content input").value = parseSearchArgs().word;
    }
} catch (error) {null};
let canvas = document.getElementById("result");
let ctx = canvas.getContext("2d");
let positions = [[108, 94, 24, 2/3, 200, 408], [8, 146, 24, 2], [8, 217, 24, 3], [8, 313, 24, 4], [8, 450, 24, 5], [8, 600, 24, 5], [8, 749, 24, 3], [8, 864, 24, 4], [8, 991, 24, 3], [60, 1080, 18, 1, 240], [8, 1124, 24, 3], [8, 1230, 24, 4]];
let color = "#000000";
let img = new Image();
img.src = "/assets/demo.jpg";
img.onload = () => ctx.drawImage(img, 0, 0, 616, 1334);
async function check() {
    id = document.querySelector(".form-leader :nth-child(1) .question-content input").value;
    word = document.querySelector(".form-leader :nth-child(2) .question-content input").value;
    await fetch(`/handle?method=read&id=${id}&word=${word}`).then(res => {
        if (res.status != 200 || !res.ok) {
            switch (res.status) {
                case 429:
                    createToast("error", `错误码：${res.status}<br>您的请求过于频繁`, true, 2);
                    break;
                case 404:
                    createToast("error", `错误码：${res.status}<br>指定ID的问卷不存在`, true, 2);
                    break;
                case 403:
                    createToast("error", `错误码：${res.status}<br>您提交的口令有误`, true, 2);
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
        if (data.data.data[1]) {
            createToast("error", `错误码：301<br>该问卷已填写完成！即将跳转到查询页`, true, 2);
            window.location.href = `/read?id=${id}`;
            return;
        }
        document.querySelector(".form-leader").style.display = "none";
        document.querySelector(".form-main").style.display = "block";
    });
}
async function submit() {
    let result = {"data": []};
    let error = false;
    let answers = Array.from(document.querySelector(".form-main").children);
    answers.forEach((element, index) => {
        if (element.className == "question text-answer") {
            if (element.querySelector("textarea").value) {
                result.data.push(element.querySelector("textarea").value);
                if (element.querySelector(".question-content-error")) {
                    element.querySelector(".form-simple-main").classList.remove("error");
                    element.querySelector(".question-content-error").remove();
                }
                if (element.querySelector("textarea").value.length > positions[index][3] * 12) {
                    error = true;
                    element.querySelector(".form-simple-main").classList.add("error");
                    let errorDiv = document.createElement("div");
                    errorDiv.className = "question-content-error";
                    errorDiv.innerHTML = "超出字数限制！本问题最多填写" + String((positions[index][3] * 12).toFixed(0)) + "字";
                    element.querySelector(".question-content").appendChild(errorDiv);
                }
            } else {
                error = true;
                if (element.querySelector(".question-content-error") == null) {
                    element.querySelector(".form-simple-main").classList.add("error");
                    let errorDiv = document.createElement("div");
                    errorDiv.className = "question-content-error";
                    errorDiv.innerHTML = "该问题为必填";
                    element.querySelector(".question-content").appendChild(errorDiv);
                }
            }
        } else if (element.className == "question hex-answer") {
            let type = "^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$";
            let re = new RegExp(type);
            if (element.querySelector("textarea").value.match(re) == null) {
                error = true;
                if (element.querySelector(".question-content-error") == null) {
                    element.querySelector(".form-simple-main").classList.add("error");
                    let errorDiv = document.createElement("div");
                    errorDiv.className = "question-content-error";
                    errorDiv.innerHTML = "颜色值不合法，默认使用#000000（纯黑）";
                    element.querySelector(".question-content").appendChild(errorDiv);
                }
                element.querySelector("textarea").value = "#000000";
            } else if (element.querySelector(".question-content-error")) {
                element.querySelector(".form-simple-main").classList.remove("error");
                element.querySelector(".question-content-error").remove();
            }
            color = element.querySelector("textarea").value;
        }
    });
    if (error) {
        createToast("error", `错误码：400<br>您填写的内容存在问题，请检查`, true, 2);
        return;
    };
    if (!confirm("是否继续提交？请注意，提交后将无法修改，请仔细检查所填写信息后再提交！")) {
        return;
    }
    result.data.push(color);
    resultStr = encodeURIComponent(window.btoa(unescape(encodeURIComponent(JSON.stringify(result)))));
    await fetch(`/handle?method=save&id=${id}&data=${resultStr}`).then(res => {
        if (res.status != 200 || !res.ok) {
            switch (res.status) {
                case 429:
                    createToast("error", `错误码：${res.status}<br>您的请求过于频繁`, true, 2);
                    break;
                case 404:
                    createToast("error", `错误码：${res.status}<br>指定ID的问卷不存在`, true, 2);
                    break;
                case 403:
                    createToast("error", `错误码：${res.status}<br>您提交的口令有误`, true, 2);
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
        createToast("success", `提交成功！`, true, 2);
        drawResult(data.data.data[0], 0, data.data.data[0][data.data.data[0].length - 1])
        drawResult(result.data, 1, color);
        document.querySelector("span#url").innerHTML = `链接：${window.location.protocol+'//'+window.location.host}/read?id=${data.data.id}`;
        document.querySelector(".form-title").style.display = "none";
        document.querySelector(".form-main").style.display = "none";
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
function copyIt() {
    let innerText = event.target.innerText;
    let tmpInput = document.createElement("textarea");
    document.body.appendChild(tmpInput);
    tmpInput.value = document.querySelector("span#url").innerHTML.replace(/<br>/g, "\r\n");
    tmpInput.select();
    document.execCommand("Copy");
    tmpInput.remove();
}
function saveCanvas() {
    download(canvas.toDataURL());
}
