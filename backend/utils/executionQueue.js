/**
 * In-memory FIFO Execution Queue with concurrency limits
 * Ensures that on resource-constrained servers (e.g., 512MB RAM / 0.5 CPU),
 * we do not spawn more javac/java processes than the CPU/RAM can handle concurrently.
 */

class ExecutionQueue {
  constructor(maxConcurrency = 2) {
    this.maxConcurrency = maxConcurrency;
    this.activeCount = 0;
    this.queue = [];
  }

  /**
   * Enqueue a task (function returning a Promise)
   * @param {() => Promise<any>} task
   * @returns {Promise<any>}
   */
  enqueue(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.processNext();
    });
  }

  async processNext() {
    if (this.activeCount >= this.maxConcurrency || this.queue.length === 0) {
      return;
    }

    this.activeCount++;
    const { task, resolve, reject } = this.queue.shift();

    try {
      const result = await task();
      resolve(result);
    } catch (err) {
      reject(err);
    } finally {
      this.activeCount--;
      this.processNext();
    }
  }

  getStatus() {
    return {
      activeCount: this.activeCount,
      queuedCount: this.queue.length,
      maxConcurrency: this.maxConcurrency
    };
  }
}

// Allow setting MAX_CONCURRENT_EXECUTIONS from environment variables (defaults to 2 for 512MB server)
const concurrencyLimit = parseInt(process.env.MAX_CONCURRENT_EXECUTIONS, 10) || 2;
export const executionQueue = new ExecutionQueue(concurrencyLimit);
export default executionQueue;
