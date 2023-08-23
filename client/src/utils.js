/* Higher-order function for async/await error handling
 returns an async function
*/

export const catchErrors = fn => {
    return function(...args) {
        return fn(...args).catch((err) => {
            console.error(err);
        })
    }
}