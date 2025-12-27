(function() {
    var a_idx = 0;
    
    function getRandomColor() {
        var r = Math.floor(Math.random() * 255);
        var g = Math.floor(Math.random() * 255);
        var b = Math.floor(Math.random() * 255);
        return "rgb(" + r + "," + g + "," + b + ")";
    }

    document.addEventListener('click', function(e) {
        var a = ["富强", "民主", "文明", "和谐", "自由", "平等", "公正", "法治", "爱国", "敬业", "诚信", "友善"];
        
        var element = document.createElement("span");
        element.textContent = a[a_idx];
        a_idx = (a_idx + 1) % a.length;

        var x = e.pageX;
        var y = e.pageY;

        element.style.zIndex = 9999999;
        element.style.top = (y - 20) + "px";
        element.style.left = x + "px";
        element.style.position = "absolute";
        element.style.fontWeight = "bold";
        element.style.color = getRandomColor();
        element.style.cursor = "default";
        element.style.userSelect = "none";
        element.style.whiteSpace = "nowrap";
        
        // --- 核心调整：同步心形速度 ---
        // 时间设为 1.2s (1.2秒)，这是根据 love.js 的 alpha 衰减计算出来的
        element.style.transition = "transform 1.2s linear, opacity 1.2s linear"; 
        
        element.style.opacity = "1";
        element.style.transform = "translateY(0)";

        document.body.appendChild(element);

        setTimeout(function() {
            element.style.opacity = "0";
            // 向上漂移 80px，与心形上升高度一致
            element.style.transform = "translateY(-80px)"; 
        }, 10);

        // 1200 毫秒后移除元素
        setTimeout(function() {
            element.remove();
        }, 1200); 
    });
})();