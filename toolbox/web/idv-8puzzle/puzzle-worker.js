// Function to get neighboring states
function getNeighbors(state) {
    const neighbors = [];
    const zeroPos = state.indexOf('0');
    const x = Math.floor(zeroPos / 3);
    const y = zeroPos % 3;
    const directions = {
        'U': [-1, 0], 'D': [1, 0],
        'L': [0, -1], 'R': [0, 1]
    };
    for (let dir in directions) {
        const dx = directions[dir][0];
        const dy = directions[dir][1];
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < 3 && ny >= 0 && ny < 3) {
            const newPos = nx * 3 + ny;
            let arr = state.split('');
            [arr[zeroPos], arr[newPos]] = [arr[newPos], arr[zeroPos]];
            neighbors.push(arr.join(''));
        }
    }
    return neighbors;
}

// Function to perform BFS search
function bfsSolve(start, goal = '123456780') {
    const queue = [start];
    const visited = {};
    visited[start] = null;

    while (queue.length > 0) {
        const current = queue.shift();
        if (current === goal) {
            const path = [];
            let temp = current;
            while (temp !== null) {
                path.push(temp);
                temp = visited[temp];
            }
            return path.reverse();
        }
        for (const nxt of getNeighbors(current)) {
            if (!visited.hasOwnProperty(nxt)) {
                visited[nxt] = current;
                queue.push(nxt);
            }
        }
    }
    return [];
}

// Handle messages from the main thread
self.onmessage = function(e) {
    const solution = bfsSolve(e.data);
    self.postMessage(solution);
};