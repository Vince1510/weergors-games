const HIGH_SCORE_KEY = "kaiser-craze-high-score";

export class ScoreManager {
  public static getHighScore(): number {
    const savedScore = Number.parseInt(
      window.localStorage.getItem(HIGH_SCORE_KEY) ?? "0",
      10,
    );
    return Number.isFinite(savedScore) && savedScore > 0 ? savedScore : 0;
  }

  public static saveHighScore(score: number): void {
    window.localStorage.setItem(HIGH_SCORE_KEY, String(score));
  }
}
