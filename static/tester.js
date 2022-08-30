const p1 = new Promise((resolve, reject) => {
    console.log("a1");
    resolve("a2");
});
const p2 = new Promise((resolve, reject) => {
    console.log("b1");
    reject("b2");
});
const p3 = new Promise((resolve, reject) => {
    console.log("c1");
    resolve("c2");
});
Promise.all([p1, p2, p3])
    .then(v => {
        for (i of v) {
            console.log(i);
        }
    })
    .catch(v => console.log(v));