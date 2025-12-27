function initTagCloud() {
    try {
        TagCanvas.Start('resCanvas', 'resCanvasLinks', {
            // --- 颜色与外观 ---
            textColour: '#222', 
            outlineColor: 'transparent',
            textHeight: 18,
            textFont: 'inherit',
            shape: 'sphere',
            zoom: 1,

            // --- 鼠标移开后继续旋转的关键 ---
            // initial [横向速度, 纵向速度]
            // 数值建议在 0.05 到 0.2 之间，正负号控制方向
            initial: [0.1, -0.1],   // 进入时的初始动力
            minSpeed: 0.03,         // 【新增】鼠标离开后的最低持续速度，绝不停止
            maxSpeed: 0.03,         // 鼠标进入时的最高跟随速度
            reverse: true,          // 鼠标在哪往哪转
            
            // --- 交互细节 ---
            freezeActive: false,   // 鼠标悬停时不冻结，保持动态
            dragControl: false,    // 设为 false，鼠标只要移入就触发追随，不需要点击拨动
            noSelect: false,       // 允许点击跳转链接
            decel: 0.95,           // 减速系数，离开鼠标后平滑过渡到 initial 速度
            
            // --- 其他 ---
            wheelZoom: false,
            clickToFront: 600
        });
    } catch(e) {
        var container = document.getElementById('myCanvasContainer');
        if(container) container.style.display = 'none';
    }
}

// 页面加载完成后执行
window.onload = initTagCloud;

// 如果你开启了 PJAX (NexT 主题常用)，需要监听 pjax:success 重新初始化
document.addEventListener('pjax:success', initTagCloud);