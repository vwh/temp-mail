/**
 * Performance monitoring utilities
 */

/**
 * Simple performance timer for measuring operation duration
 */
export class PerformanceTimer {
	private startTime: number;
	private label: string;

	constructor(label: string) {
		this.label = label;
		this.startTime = performance.now();
	}

	/**
	 * End the timer and log the duration
	 */
	end(): number {
		const duration = performance.now() - this.startTime;
		console.log(`[PERF] ${this.label}: ${duration.toFixed(2)}ms`);
		return duration;
	}

	/**
	 * Get current duration without ending the timer
	 */
	current(): number {
		return performance.now() - this.startTime;
	}
}
