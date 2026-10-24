const BEST_SCORE_KEY = "job-sky-jump-best-score";
const LAST_SCORE_KEY = "job-sky-jump-last-score";

export class ScoreManager {
  private score = 0;

  public getScore(): number {
    return this.score;
  }

  public setScore(score: number): void {
    this.score = score;
  }

  public getBestScore(): number {
    return this.readScore(BEST_SCORE_KEY);
  }

  public saveScore(): number {
    const bestScore = Math.max(this.score, this.getBestScore());
    window.localStorage.setItem(LAST_SCORE_KEY, String(this.score));
    window.localStorage.setItem(BEST_SCORE_KEY, String(bestScore));
    return bestScore;
  }

  private readScore(key: string): number {
    const score = Number.parseInt(window.localStorage.getItem(key) ?? "0", 10);
    return Number.isFinite(score) && score > 0 ? score : 0;
  }
}
