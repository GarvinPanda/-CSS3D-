
(function () {
    var _ground = document.getElementsByClassName("ground")[0];
    var _camera = document.getElementsByClassName("camera")[0];
    var _step = document.getElementsByClassName("step")[0];
    var _perstep = document.getElementsByClassName("per-step")[0];
    var _tip = document.getElementsByClassName("tip")[0];

    /** 鼠标上次位置 */
    var lastX = 0, lastY = 0;
    /** 步数 */
    var stepCount = 0;
    /** 控制一次滑动 */
    var isDown = false;
    /** 当前位置 */
    var position = { x: 0, y: 0 };
    /** 上次变换值 */
    var lastTransform = {
        translateX: '0px',
        translateY: '0px',
        translateZ: '25px',
        rotateX: '0deg',
        rotateY: '0deg',
        rotateZ: '0deg'
    };
    /** 下一步转向 */
    var nextRotateDir = ["X", "Y"];
    /** 所有的转向 */
    var allRotateDir = ["X", "Y", "Z"];
    /** 障碍物 */
    var blockArr = [];
    /** 全部路径 */
    var stack = [];

    /** 监听鼠标按下 */
    document.addEventListener("mousedown", (e) => {
        lastX = e.clientX;
        lastY = e.clientY;
        isDown = true;
    });

    /** 监听鼠标移动 */
    document.addEventListener("mousemove", (e) => {
        if (!isDown) return;
        let _offsetX = e.clientX - lastX;
        let _offsetY = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        // _ground.style.transform = "translateX(-50%) translateY(-50%) rotateX(117deg) rotateZ(160deg)";
        var matrix4 = new Matrix4();
        var bg_style = document.defaultView.getComputedStyle(_ground, null).transform;
        var camera_style = document.defaultView.getComputedStyle(_camera, null).perspectiveOrigin;
        var _cy = +camera_style.split(' ')[1].split('px')[0];
        console.log("矩阵变换---->>>",bg_style);

        var str = bg_style.split("matrix3d(")[1].split(")")[0].split(",");

        var oldMartrix4 = str.map((item) => +item);

        // console.log("old", oldMartrix4);
        var dirH = 1, dirV = 1;
        if (_offsetX < 0) {
            dirH = -1;
        }

        if (_offsetY > 0) {
            dirV = -1;
        }
        var angleZ = 2 * dirH;

        var newMartri4 = matrix4.set(Math.cos(angleZ * Math.PI / 180), -Math.sin(angleZ * Math.PI / 180), 0, 0, Math.sin(angleZ * Math.PI / 180), Math.cos(angleZ * Math.PI / 180), 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
        // var newMartri4_1 = matrix4.set(1, 0, 0, 0, 0, Math.cos(angleX * Math.PI / 180), Math.sin(angleX * Math.PI / 180), 0, 0, -Math.sin(angleX * Math.PI / 180), Math.cos(angleX * Math.PI / 180), 0, 0, 0, 0, 1);
        // var newMartri4_1 = matrix4.set(Math.cos(angleX * Math.PI / 180), 0, -Math.sin(angleX * Math.PI / 180), 0, 0, 1, 0, 0, Math.sin(angleX * Math.PI / 180), 0, Math.cos(angleX * Math.PI / 180), 0, 0, 0, 0, 1);
        // console.log("new", newMartri4)

        var new_mar = null;
        if (Math.abs(_offsetX) > Math.abs(_offsetY)) {
            new_mar = matrix4.multiplyMatrices(oldMartrix4, newMartri4);
        } else {
            _camera.style.perspectiveOrigin = `500px ${_cy + 10 * dirV}px`;
        }
        // console.log(new_mar);
        // console.log(`matrix3d(${new_mar.join(',')});`);
        new_mar && (_ground.style.transform = `matrix3d(${new_mar.join(',')})`);
    });
    document.addEventListener("mouseup", (e) => {
        isDown = false;
    });

    //监听键盘
    document.onkeydown = function (e) {
        /** 移动物体 */
        move(e.key);
    }

    //监听滚轮
    // document.addEventListener('mousewheel', (e) => {
    //     var per = document.defaultView.getComputedStyle(_camera, null).perspective;
    //     let newper = (+per.split("px")[0] + Math.floor(e.deltaY / 10)) + "px";
    //     _camera.style.perspective = newper
    // }, false);

    /** 移动盒子 */
    function move(key) {
        if (isBlock(key)) return;
        const v = getNoneV2Arr(nextRotateDir, allRotateDir);
        if (key == "w" || key == "s") {
            nextRotateDir[1] = v;
        } else {
            nextRotateDir[0] = v;
        }

        var target = document.getElementsByClassName("box-con")[0];
        // var target_style = document.defaultView.getComputedStyle(target, null).transform;
        // var str = target_style.split("matrix3d(")[1].split(")")[0].split(",");

        let lastRotateX = +lastTransform.rotateX.split('deg')[0];
        let lastRotateY = +lastTransform.rotateY.split('deg')[0];
        let lastRotateZ = +lastTransform.rotateZ.split('deg')[0];
        let lastTranslateX = +lastTransform.translateX.split('px')[0];
        let lastTranslateY = +lastTransform.translateY.split('px')[0];
        let lastTranslateZ = +lastTransform.translateZ.split('px')[0];

        let lastRotate = {
            lastRotateX, lastRotateY, lastRotateZ, lastTranslateX, lastTranslateY, lastTranslateZ
        }

        let dir = 1;
        console.log("8888-----", nextRotateDir)
        let strTransfrom = ""
        switch (key) {
            case 'w':
                position.y++;
                lastTransform.translateY = position.y * 50 + 'px';
                if (nextRotateDir[0] == "X") {
                    if (Math.floor(Math.abs(lastRotate.lastRotateZ) / 90) % 2 == 1) {
                        dir = calRotateDir(lastRotateX, lastRotateZ);
                        lastTransform[`rotateY`] = (lastRotate[`lastRotateY`] + 90 * dir) + 'deg';
                    } else {
                        // dir = calRotateDir(lastRotateY, lastRotateZ);
                        console.log("dir---88", dir)
                        lastTransform[`rotateX`] = (lastRotate[`lastRotateX`] - 90 * dir) + 'deg';
                    }
                }

                if (nextRotateDir[0] == "Y") {
                    if (Math.floor(Math.abs(Math.abs(lastRotate.lastRotateZ)) / 90) % 2 == 1) {
                        dir = calRotateDir(lastRotateY, lastRotateZ);
                        lastTransform[`rotateX`] = (lastRotate[`lastRotateX`] + 90 * dir) + 'deg';
                    } else {
                        dir = calRotateDir(lastRotateX, lastRotateY);
                        lastTransform[`rotateZ`] = (lastRotate[`lastRotateZ`] + 90 * dir) + 'deg';
                    }
                }

                if (nextRotateDir[0] == "Z") {
                    dir = calRotateDir(lastRotateX, lastRotateY);
                    lastTransform[`rotate${nextRotateDir[0]}`] = (lastRotate[`lastRotate${nextRotateDir[0]}`] - 90 * dir) + 'deg';
                }
                break;
            case 's':
                position.y--;
                lastTransform.translateY = position.y * 50 + 'px';
                if (nextRotateDir[0] == "X") {
                    if (Math.floor(Math.abs(lastRotate.lastRotateZ) / 90) % 2 == 1) {
                        dir = calRotateDir(lastRotateX, lastRotateZ);
                        lastTransform[`rotateY`] = (lastRotate[`lastRotateY`] - 90 * dir) + 'deg';
                    } else {
                        // dir = calRotateDir(lastRotateZ, lastRotateY);
                        lastTransform[`rotateX`] = (lastRotate[`lastRotateX`] + 90 * dir) + 'deg';
                    }
                }

                if (nextRotateDir[0] == "Y") {
                    if (Math.floor(Math.abs(lastRotate.lastRotateZ) / 90) % 2 == 1) {
                        dir = calRotateDir(lastRotateZ, lastRotateY);
                        lastTransform[`rotateX`] = (lastRotate[`lastRotateX`] - 90 * dir) + 'deg';
                    } else {
                        // dir = calRotateDir(lastRotateX, lastRotateY);
                        lastTransform[`rotateZ`] = (lastRotate[`lastRotateZ`] - 90 * dir) + 'deg';
                    }
                }

                if (nextRotateDir[0] == "Z") {
                    dir = calRotateDir(lastRotateX, lastRotateY);
                    lastTransform[`rotate${nextRotateDir[0]}`] = (lastRotate[`lastRotate${nextRotateDir[0]}`] + 90 * dir) + 'deg';
                }
                // target.style.transform = `translateX(${position.x * 50}px) translateY(${position.y * 50}px)  translateZ(25px) rotateX(${position.y * -90}deg)`;
                break;
            case 'a':
                position.x++;
                lastTransform.translateX = position.x * 50 + 'px';

                if (nextRotateDir[1] == "X") {
                    if (Math.floor(Math.abs(lastRotate.lastRotateZ) / 90) % 2 == 1) {
                        dir = calRotateDir(lastRotateX, lastRotateZ);
                        lastTransform[`rotateY`] = (lastRotate[`lastRotateY`] + 90 * dir) + 'deg';
                    } else {
                        // dir = calRotateDir(lastRotateZ, lastRotateY);
                        lastTransform[`rotateX`] = (lastRotate[`lastRotateX`] - 90 * dir) + 'deg';
                    }
                }

                if (nextRotateDir[1] == "Y") {
                    if (Math.floor(Math.abs(lastRotate.lastRotateZ) / 90) % 2 == 1) {
                        dir = calRotateDir(lastRotateZ, lastRotateY);
                        lastTransform[`rotateX`] = (lastRotate[`lastRotateX`] - 90 * dir) + 'deg';
                    } else {
                        // dir = calRotateDir(lastRotateX, lastRotateZ);
                        console.log("dir---", dir)
                        lastTransform[`rotateY`] = (lastRotate[`lastRotateY`] + dir * 90) + 'deg';
                    }
                }

                if (nextRotateDir[1] == "Z") {
                    dir = calRotateDir(lastRotateX, lastRotateY);
                    console.log("dir====", dir)
                    lastTransform[`rotate${nextRotateDir[1]}`] = (lastRotate[`lastRotate${nextRotateDir[1]}`] - 90 * dir) + 'deg';
                }
                break;
            case 'd':
                position.x--;
                lastTransform.translateX = position.x * 50 + 'px';

                if (nextRotateDir[1] == "X") {
                    if (Math.floor(Math.abs(lastRotate.lastRotateZ) / 90) % 2 == 1) {
                        dir = calRotateDir(lastRotateX, lastRotateZ);
                        lastTransform[`rotateY`] = (lastRotate[`lastRotateY`] + 90 * dir) + 'deg';
                    } else {
                        // dir = calRotateDir(lastRotateZ, lastRotateY);
                        lastTransform[`rotateX`] = (lastRotate[`lastRotateX`] - 90 * dir) + 'deg';
                    }
                }

                if (nextRotateDir[1] == "Y") {
                    if (Math.floor(Math.abs(lastRotate.lastRotateZ) / 90) % 2 == 1) {
                        dir = calRotateDir(lastRotateZ, lastRotateY);
                        lastTransform[`rotateX`] = (lastRotate[`lastRotateX`] + 90 * dir) + 'deg';
                    } else {
                        // dir = calRotateDir(lastRotateX, lastRotateZ);
                        lastTransform[`rotateY`] = (lastRotate[`lastRotateY`] - 90 * dir) + 'deg';
                    }
                }

                if (nextRotateDir[1] == "Z") {
                    dir = calRotateDir(lastRotateX, lastRotateY);
                    lastTransform[`rotate${nextRotateDir[1]}`] = (lastRotate[`lastRotate${nextRotateDir[1]}`] + 90 * dir) + 'deg';
                }

                // target.style.transform = `translateX(${position.x * 50}px) translateY(${position.y * 50}px)  translateZ(25px) rotateY(${position.x * 90}deg)`;
                break;
        }
        //赋值样式
        for (let item in lastTransform) {
            strTransfrom += item + '(' + lastTransform[item] + ') ';
        }
        console.log("str--", strTransfrom);
        target.style.transform = strTransfrom;

        stepCount++;
        _step.innerHTML = `${stepCount}步`;
    }


    /** 棋盘 */
    function pan() {
        var grid = [
            0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0,
            0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0,
            1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1,
            0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0,
            0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0,
            0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0,
            1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0,
            1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0,
            0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1,
            0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0,
            1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0,
            1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0,
            0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0
        ];
        console.log(grid.length);

        const con = document.getElementsByClassName("pan")[0];
        const block = document.getElementsByClassName("block")[0];
        let elArr = [];
        grid.forEach((item, index) => {
            let r = Math.floor(index / 15);
            let c = index % 15;
            const gezi = document.createElement("div");
            gezi.classList = "pan-item"
            // gezi.innerHTML = `${r},${c}`
            con.appendChild(gezi);
            var newBlock = block.cloneNode(true);
            // console.log(panArr[r][c])

            if (item == 1) {
                gezi.appendChild(newBlock);
                blockArr.push(c + "-" + r);
            }
            elArr.push(gezi);
        });
        const panArr = arrTrans(15, grid);
        return { elArr, panArr };
    }
    const panData = pan();
    const { elArr, panArr } = panData;
    // console.log(elArr)

    var step = getShortPath(panArr, { x: 0, y: 0 }, { x: 14, y: 14 }, 0);
    console.log("最短距离----", step);
    _perstep.innerHTML = `请在<span>${step}</span>步内走到终点`;
    var path = recall({ x: 14, y: 14 });
    console.log("路径---", path);

    /** 提示 */
    var tipCount = 0;
    _tip.addEventListener("click", () => {
        console.log("9999", tipCount)
        elArr.forEach((item, index) => {
            let r = Math.floor(index / 15);
            let c = index % 15;
            path.forEach((_item, i) => {
                if (_item.x == r && _item.y == c) {
                    // console.log("ooo",_item)
                    if (tipCount % 2 == 0)
                        item.classList = "pan-item pan-path";
                    else
                        item.classList = "pan-item";

                }
            })
        });
        tipCount++;
    })


    /**
     * BFS 实现寻路
     * @param {*} grid 
     * @param {*} start {x: 0,y: 0}
     * @param {*} end {x: 3,y: 3}
     */
    function getShortPath(grid, start, end, a) {
        let maxL_x = grid.length;
        let maxL_y = grid[0].length;
        let queue = new Queue();
        let step = 0;
        //上左下右
        let dx = [1, 0, -1, 0];
        let dy = [0, 1, 0, -1];
        //加入第一个元素
        queue.enqueue(start);

        //存储一个一样的用来排查是否遍历过
        let mem = new Array(maxL_x);
        for (let n = 0; n < maxL_x; n++) {
            mem[n] = new Array(maxL_y);
            mem[n].fill(10000);
        }

        while (!queue.isEmpty()) {
            // console.log(queue)
            // stack.push(queue);
            let p = [];
            for (let i = queue.size(); i > 0; i--) {
                // console.log(0)
                let preTraget = queue.dequeue();
                p.push(preTraget);
                //找到目标

                if (preTraget.x == end.x && preTraget.y == end.y) {
                    stack.push(p);
                    return step;
                }

                for (let j = 0; j < 4; j++) {
                    let nextX = preTraget.x + dx[j];
                    let nextY = preTraget.y + dy[j];

                    if (nextX < maxL_x && nextX >= 0 && nextY < maxL_y && nextY >= 0) {
                        let nextTraget = { x: nextX, y: nextY };
                        // console.log("坐标", nextX, nextY, grid[1][0])
                        if (grid[nextX][nextY] == a && a < mem[nextX][nextY]) {
                            queue.enqueue({ ...nextTraget, f: { x: preTraget.x, y: preTraget.y } });
                            mem[nextX][nextY] = a;
                        }
                    }
                }
            }
            stack.push(p);
            step++;
        }
    }

    /** 寻找到路径 */
    function recall(end) {
        let path = [];
        let front = { x: end.x, y: end.y };
        while (stack.length) {
            let item = stack.pop();
            for (let i = 0; i < item.length; i++) {
                if (!item[i].f) break;
                if (item[i].x == front.x && item[i].y == front.y) {
                    path.push({ x: item[i].x, y: item[i].y });
                    front.x = item[i].f.x;
                    front.y = item[i].f.y;
                    break;
                }
            }
        }
        return path;
    }


    /** 是否是障碍 */
    function isBlock(dir) {
        let str;
        if (dir == "w") {
            if (position.y + 1 > 14) {
                return true;
            }
            str = position.x + "-" + (position.y + 1);
        }

        if (dir == "s") {
            if (position.y - 1 < 0) {
                return true;
            }
            str = position.x + "-" + (position.y - 1);
        }

        if (dir == "a") {
            if (position.x + 1 > 14) {
                return true;
            }
            str = (position.x + 1) + "-" + position.y;
        }

        if (dir == "d") {
            if (position.x - 1 < 0) {
                return true;
            }
            str = (position.x - 1) + "-" + position.y;
        }
        if (blockArr.indexOf(str) > -1) {
            return true;
        }
        return false;
    }
})();


//确认旋转轴
function calRotateDir(angle1, angle2) {
    console.log("两个角度----", angle1, angle2)
    if (angle2 + angle1 >= 0) return -1;
    if (angle2 + angle1 < 0) return 1;
    if (angle1 < 0 || angle2 < 0) return -1;
    let a = Math.floor(angle1 / 180);
    let b = Math.floor(angle2 / 180);
    console.log(a, b)
    return Math.abs(a + b) % 2 == 0 ? 1 : -1;
}

//获取数组中没有的v
function getNoneV2Arr(arr1, arr2) {
    var v = "";
    for (let i = 0; i < arr2.length; i++) {
        if (arr1.indexOf(arr2[i]) == -1) {
            v = arr2[i];
            break;
        }
    }
    return v;
}

/** 对列 */
function Queue() {
    this.items = [];
    //1. 将元素加到元素中
    Queue.prototype.enqueue = function (el) {
        this.items.push(el);
    }
    //2.从队列中删除元素
    Queue.prototype.dequeue = function () {
        return this.items.shift();
    }
    //3.查看元素
    Queue.prototype.front = function () {
        return this.items[0];
    }
    //4.是否为空
    Queue.prototype.isEmpty = function () {
        return this.items.length == 0;
    }
    //5.长度
    Queue.prototype.size = function () {
        return this.items.length;
    }
}

/** 一维数组转二维数组 */
function arrTrans(num, arr) {
    const newArr = [];
    while (arr.length > 0) {
        newArr.push(arr.splice(0, num));
    }
    return newArr;
}
